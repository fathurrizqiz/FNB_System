<?php

namespace Tests\Feature;

use App\Models\MenuModel;
use App\Models\OrderMenu;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherCampaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoucherFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_request_qr_claim_it_and_submit_a_rating_without_a_comment(): void
    {
        $campaign = $this->createCampaign();
        $menu = $this->createMenu();

        $response = $this->post('/vouchers', [
            'voucher_campaign_id' => $campaign->id,
            'whatsapp_number' => '081234567890',
        ]);

        $response->assertRedirect();
        $voucherPath = parse_url((string) $response->headers->get('Location'), PHP_URL_PATH);
        $token = basename((string) $voucherPath);
        $this->assertSame(64, strlen($token));

        $this->get((string) $voucherPath)
            ->assertInertia(fn ($page) => $page
                ->component('Voucher/show')
                ->where('status', 'issued')
                ->where('campaign.name', 'Promo Pelanggan')
                ->has('qrCode'));

        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post('/admin/vouchers/claim', ['token' => $token])
            ->assertSessionHas('success');

        $voucher = Voucher::query()->where('token_hash', hash('sha256', $token))->firstOrFail();
        $this->assertSame('claimed', $voucher->status);

        $this->from('/evaluasi')->post('/evaluasi', [
            'name' => 'Budi Santoso',
            'voucher_token' => $token,
            'menu_id' => $menu->id,
            'rating' => 5,
        ])->assertRedirect('/')
            ->assertSessionHas('voucher_code', $token);

        $this->assertDatabaseHas('evaluasi_melted', [
            'name' => 'Budi Santoso',
            'comment' => '',
            'menu_id' => $menu->id,
            'rating' => 5,
            'voucher_id' => $voucher->id,
        ]);
        $this->assertDatabaseHas('vouchers', [
            'id' => $voucher->id,
            'status' => 'evaluated',
        ]);
    }

    public function test_only_admins_can_claim_a_voucher_and_a_voucher_cannot_be_claimed_twice(): void
    {
        $campaign = $this->createCampaign();
        $token = str_repeat('a', 64);
        $voucher = $this->createVoucher($campaign, $token);

        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->post('/admin/vouchers/claim', ['token' => $token])
            ->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post('/admin/vouchers/claim', ['token' => $token])
            ->assertSessionHas('success');
        $this->actingAs($admin)
            ->from('/admin/vouchers')
            ->post('/admin/vouchers/claim', ['token' => $token])
            ->assertSessionHasErrors([
                'token' => 'QR tidak valid, sudah diklaim, atau promonya tidak aktif.',
            ]);

        $this->assertDatabaseHas('vouchers', [
            'id' => $voucher->id,
            'status' => 'claimed',
            'claimed_by' => $admin->id,
        ]);
    }

    public function test_customer_can_receive_only_one_voucher_per_campaign(): void
    {
        $campaign = $this->createCampaign();
        $payload = [
            'voucher_campaign_id' => $campaign->id,
            'whatsapp_number' => '081234567890',
        ];

        $this->post('/vouchers', $payload)->assertRedirect();
        $this->from('/')
            ->post('/vouchers', $payload)
            ->assertSessionHasErrors([
                'whatsapp_number' => 'Nomor WhatsApp ini sudah pernah memperoleh voucher untuk promo tersebut.',
            ]);

        $this->assertDatabaseCount('vouchers', 1);
    }

    public function test_order_applies_percentage_discount_and_reserves_evaluated_voucher(): void
    {
        $campaign = $this->createCampaign([
            'discount_type' => 'percentage',
            'discount_value' => 10,
        ]);
        $menu = $this->createMenu();
        $voucher = $this->createVoucher($campaign, str_repeat('b', 64), [
            'customer_phone' => '6281234567890',
            'status' => 'evaluated',
        ]);

        $response = $this->post('/menu/order', [
            'customer_name' => 'Budi Santoso',
            'whatsapp_number' => '081234567890',
            'voucher_code' => str_repeat('b', 64),
            'items' => [
                ['menu_id' => $menu->id, 'quantity' => 2],
            ],
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('whatsapp_url', function (string $url): bool {
            parse_str((string) parse_url($url, PHP_URL_QUERY), $query);
            $message = urldecode((string) ($query['text'] ?? ''));

            return str_contains($message, '*Potongan:* Rp 2.500')
                && str_contains($message, '*Total estimasi:* Rp 22.500');
        });

        $order = OrderMenu::query()->firstOrFail();
        $this->assertSame('2500.00', $order->discount_amount);
        $this->assertSame($voucher->id, $order->voucher_id);
        $this->assertSame('reserved', $voucher->fresh()->status);
    }

    public function test_order_applies_fixed_discount_without_exceeding_the_subtotal(): void
    {
        $campaign = $this->createCampaign([
            'discount_type' => 'fixed',
            'discount_value' => 5000,
        ]);
        $menu = $this->createMenu();
        $this->createVoucher($campaign, str_repeat('f', 64), [
            'status' => 'evaluated',
        ]);

        $this->post('/menu/order', [
            'customer_name' => 'Budi Santoso',
            'whatsapp_number' => '081234567890',
            'voucher_code' => str_repeat('f', 64),
            'items' => [
                ['menu_id' => $menu->id, 'quantity' => 2],
            ],
        ])->assertRedirect('/');

        $this->assertSame('5000.00', OrderMenu::query()->firstOrFail()->discount_amount);
    }

    public function test_order_rejects_voucher_until_evaluation_is_complete(): void
    {
        $campaign = $this->createCampaign();
        $menu = $this->createMenu();
        $voucher = $this->createVoucher($campaign, str_repeat('c', 64), [
            'status' => 'claimed',
        ]);

        $this->from('/')
            ->post('/menu/order', [
                'customer_name' => 'Budi Santoso',
                'whatsapp_number' => '081234567890',
                'voucher_code' => str_repeat('c', 64),
                'items' => [
                    ['menu_id' => $menu->id, 'quantity' => 2],
                ],
            ])
            ->assertSessionHasErrors([
                'voucher_code' => 'Voucher tidak valid, belum dievaluasi, atau sudah digunakan.',
            ]);

        $this->assertDatabaseCount('order_menu', 0);
        $this->assertSame('claimed', $voucher->fresh()->status);
    }

    public function test_order_rejects_evaluated_voucher_when_minimum_item_count_is_not_met(): void
    {
        $campaign = $this->createCampaign();
        $menu = $this->createMenu();
        $voucher = $this->createVoucher($campaign, str_repeat('d', 64), [
            'status' => 'evaluated',
        ]);

        $this->from('/')
            ->post('/menu/order', [
                'customer_name' => 'Budi Santoso',
                'whatsapp_number' => '081234567890',
                'voucher_code' => str_repeat('d', 64),
                'items' => [
                    ['menu_id' => $menu->id, 'quantity' => 1],
                ],
            ])
            ->assertSessionHasErrors([
                'voucher_code' => 'Jumlah item pesanan belum memenuhi syarat minimal voucher.',
            ]);

        $this->assertDatabaseCount('order_menu', 0);
        $this->assertSame('evaluated', $voucher->fresh()->status);
    }

    public function test_evaluation_requires_a_product_and_rating_for_voucher_redemption(): void
    {
        $campaign = $this->createCampaign();
        $token = str_repeat('e', 64);
        $this->createVoucher($campaign, $token, ['status' => 'claimed']);

        $this->from('/evaluasi')
            ->post('/evaluasi', [
                'name' => 'Budi Santoso',
                'voucher_token' => $token,
            ])
            ->assertSessionHasErrors([
                'menu_id' => 'Pilih produk yang ingin dinilai.',
                'rating' => 'Pilih rating bintang 1 sampai 5.',
            ]);

        $this->assertDatabaseCount('evaluasi_melted', 0);
    }

    private function createCampaign(array $attributes = []): VoucherCampaign
    {
        return VoucherCampaign::query()->create([
            'name' => 'Promo Pelanggan',
            'discount_type' => 'fixed',
            'discount_value' => 5000,
            'min_items' => 2,
            'is_active' => true,
            ...$attributes,
        ]);
    }

    private function createVoucher(
        VoucherCampaign $campaign,
        string $token,
        array $attributes = [],
    ): Voucher {
        return $campaign->vouchers()->create([
            'customer_phone' => '6281234567890',
            'token_hash' => hash('sha256', $token),
            ...$attributes,
        ]);
    }

    private function createMenu(): MenuModel
    {
        return MenuModel::query()->create([
            'name' => 'Pisang Cokelat',
            'category' => 'Pisang',
            'description' => 'Pisang dengan cokelat lumer.',
            'price' => 12500,
        ]);
    }
}
