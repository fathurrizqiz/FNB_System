<?php

namespace Tests\Feature;

use App\Models\MenuModel;
use App\Models\OrderMenu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_landing_page_displays_the_crud_menu_catalog(): void
    {
        $menu = $this->createMenu();

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->component('Landing/landingpage')
                ->has('menuItems', 1)
                ->where('menuItems.0.id', $menu->id)
                ->where('menuItems.0.name', 'Pisang Cokelat')
                ->where('whatsappNumber', '62895384223639'));
    }

    public function test_valid_checkout_saves_the_order_and_returns_a_whatsapp_trigger(): void
    {
        $menu = $this->createMenu();

        $response = $this->from('/')->post('/menu/order', [
            'customer_name' => 'Budi Santoso',
            'whatsapp_number' => '081234567890',
            'delivery_method' => 'Takeaway / Ambil Sendiri',
            'notes' => 'Tanpa topping',
            'items' => [
                ['menu_id' => $menu->id, 'quantity' => 2],
            ],
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('success');
        $response->assertSessionHas('whatsapp_url', fn (string $url): bool => str_starts_with($url, 'https://wa.me/62895384223639?text='));
        $this->assertDatabaseHas('order_menu', [
            'menu_id' => $menu->id,
            'quantity' => 2,
            'customer_name' => 'Budi Santoso',
            'whatsapp_number' => '081234567890',
            'delivery_method' => 'Takeaway / Ambil Sendiri',
            'notes' => 'Tanpa topping',
            'unit_price' => '12500.00',
            'status' => 'pending',
        ]);
        $this->assertSame(1, OrderMenu::query()->distinct('order_number')->count('order_number'));
    }

    public function test_checkout_rejects_an_invalid_customer_whatsapp_number_without_saving_orders(): void
    {
        $menu = $this->createMenu();

        $this->from('/')
            ->post('/menu/order', [
                'customer_name' => 'Budi Santoso',
                'whatsapp_number' => 'not-a-number',
                'items' => [
                    ['menu_id' => $menu->id, 'quantity' => 1],
                ],
            ])
            ->assertSessionHasErrors([
                'whatsapp_number' => 'Masukkan nomor WhatsApp yang valid.',
            ]);

        $this->assertDatabaseCount('order_menu', 0);
    }

    public function test_checkout_rejects_quantities_over_one_hundred_without_saving_orders(): void
    {
        $menu = $this->createMenu();

        $this->from('/')
            ->post('/menu/order', [
                'customer_name' => 'Budi Santoso',
                'whatsapp_number' => '081234567890',
                'items' => [
                    ['menu_id' => $menu->id, 'quantity' => 101],
                ],
            ])
            ->assertSessionHasErrors([
                'items.0.quantity' => 'Jumlah setiap menu maksimal 100 porsi.',
            ]);

        $this->assertDatabaseCount('order_menu', 0);
    }

    public function test_admin_can_confirm_an_order_and_a_non_admin_cannot_access_order_management(): void
    {
        $menu = $this->createMenu();
        $order = OrderMenu::query()->create([
            'menu_id' => $menu->id,
            'quantity' => 1,
            'customer_name' => 'Budi Santoso',
            'whatsapp_number' => '081234567890',
            'unit_price' => $menu->price,
            'order_number' => 'MB-TESTORDER',
            'status' => 'pending',
        ]);

        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->get('/admin/orders')
            ->assertForbidden();

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->patch("/admin/orders/{$order->id}/status", ['status' => 'confirmed'])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('order_menu', [
            'order_number' => 'MB-TESTORDER',
            'status' => 'confirmed',
        ]);
    }

    private function createMenu(): MenuModel
    {
        return MenuModel::query()->create([
            'name' => 'Pisang Cokelat',
            'description' => 'Pisang dengan cokelat lumer.',
            'price' => 12500,
        ]);
    }
}
