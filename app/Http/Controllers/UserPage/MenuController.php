<?php

namespace App\Http\Controllers\UserPage;

use App\Http\Controllers\Controller;
use App\Models\MenuModel;
use App\Models\OrderMenu;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menu = MenuModel::all();

        return Inertia::render('userpage/MenuUser', [
            'menu' => $menu,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'whatsapp_number' => ['required', 'string', 'max:20', 'regex:/^(?=.*\\d)[0-9+()\\s-]{8,20}$/'],
            'delivery_method' => ['nullable', 'string', 'in:Takeaway / Ambil Sendiri,Delivery Ojol (Gojek/Grab)'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'voucher_code' => ['nullable', 'string', 'size:64'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'distinct', 'exists:Menu,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ], [
            'customer_name.required' => 'Nama pemesan wajib diisi.',
            'whatsapp_number.required' => 'Nomor WhatsApp wajib diisi agar admin dapat menghubungi Anda.',
            'whatsapp_number.regex' => 'Masukkan nomor WhatsApp yang valid.',
            'items.required' => 'Keranjang pesanan masih kosong.',
            'items.*.quantity.max' => 'Jumlah setiap menu maksimal 100 porsi.',
        ]);

        $adminWhatsAppNumber = (string) preg_replace('/\D+/', '', (string) config('services.whatsapp.number'));

        if ($adminWhatsAppNumber === '') {
            throw new \RuntimeException('Nomor WhatsApp admin belum dikonfigurasi.');
        }

        $orderNumber = 'MB-'.Str::upper((string) Str::ulid());
        $submission = DB::transaction(function () use ($validated, $orderNumber): array {
            $menuIds = collect($validated['items'])->pluck('menu_id')->unique()->values();
            $menus = MenuModel::query()
                ->whereKey($menuIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($menus->count() !== $menuIds->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Salah satu menu sudah tidak tersedia. Muat ulang halaman dan coba lagi.',
                ]);
            }

            $subtotal = collect($validated['items'])->sum(
                fn (array $item): float => (float) $menus->get($item['menu_id'])->price * $item['quantity'],
            );
            $totalQuantity = collect($validated['items'])->sum('quantity');
            $voucher = null;
            $discountAmount = 0;

            if (! empty($validated['voucher_code'])) {
                $voucher = Voucher::query()
                    ->with('campaign')
                    ->where('token_hash', hash('sha256', $validated['voucher_code']))
                    ->lockForUpdate()
                    ->first();

                if (
                    ! $voucher
                    || $voucher->status !== 'evaluated'
                    || ! $voucher->campaign?->is_active
                ) {
                    throw ValidationException::withMessages([
                        'voucher_code' => 'Voucher tidak valid, belum dievaluasi, atau sudah digunakan.',
                    ]);
                }

                if ($voucher->customer_phone !== Voucher::normalizePhone($validated['whatsapp_number'])) {
                    throw ValidationException::withMessages([
                        'voucher_code' => 'Nomor WhatsApp pesanan harus sama dengan nomor pada voucher.',
                    ]);
                }

                if ($totalQuantity < $voucher->campaign->min_items) {
                    throw ValidationException::withMessages([
                        'voucher_code' => 'Jumlah item pesanan belum memenuhi syarat minimal voucher.',
                    ]);
                }

                $discountAmount = $voucher->campaign->discount_type === 'percentage'
                    ? (int) round($subtotal * (float) $voucher->campaign->discount_value / 100)
                    : min((int) $voucher->campaign->discount_value, (int) $subtotal);

                $voucher->update(['status' => 'reserved']);
            }

            $orderLines = [];

            foreach ($validated['items'] as $index => $item) {
                $menu = $menus->get($item['menu_id']);

                if (! $menu instanceof MenuModel) {
                    throw ValidationException::withMessages([
                        'items' => 'Salah satu menu sudah tidak tersedia. Muat ulang halaman dan coba lagi.',
                    ]);
                }

                $order = OrderMenu::create([
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'customer_name' => $validated['customer_name'],
                    'whatsapp_number' => $validated['whatsapp_number'],
                    'delivery_method' => $validated['delivery_method'] ?? 'Takeaway / Ambil Sendiri',
                    'notes' => $validated['notes'] ?? null,
                    'unit_price' => $menu->price,
                    'order_number' => $orderNumber,
                    'status' => 'pending',
                    'voucher_id' => $index === 0 ? $voucher?->id : null,
                    'discount_amount' => $index === 0 ? $discountAmount : 0,
                ]);

                $orderLines[] = [
                    'order' => $order,
                    'menu_name' => $menu->name,
                ];
            }

            return [
                'orderLines' => $orderLines,
                'subtotal' => $subtotal,
                'discountAmount' => $discountAmount,
                'campaignName' => $voucher?->campaign?->name,
            ];
        });

        $orderLines = $submission['orderLines'];
        $subtotal = $submission['subtotal'];
        $discountAmount = $submission['discountAmount'];
        $total = max(0, $subtotal - $discountAmount);

        $message = collect([
            "Halo Melted Banana, saya ingin mengajukan pesanan #{$orderNumber}:",
            '',
            '*Nama:* '.$validated['customer_name'],
            '*WhatsApp:* '.$validated['whatsapp_number'],
            '*Detail pesanan:*',
            ...array_map(
                fn (array $line): string => '- '.$line['menu_name'].' x'.$line['order']->quantity.' — Rp '.number_format((float) $line['order']->unit_price * $line['order']->quantity, 0, ',', '.'),
                $orderLines,
            ),
            '*Metode:* '.($validated['delivery_method'] ?? 'Takeaway / Ambil Sendiri'),
            isset($validated['notes']) && $validated['notes'] !== '' ? '*Catatan:* '.$validated['notes'] : null,
            '*Subtotal:* Rp '.number_format($subtotal, 0, ',', '.'),
            $submission['campaignName'] !== null ? '*Voucher:* '.$submission['campaignName'] : null,
            $discountAmount > 0 ? '*Potongan:* Rp '.number_format($discountAmount, 0, ',', '.') : null,
            '*Total estimasi:* Rp '.number_format($total, 0, ',', '.'),
            '',
            'Mohon konfirmasi ketersediaan dan pesanan saya. Terima kasih!',
        ])->filter()->implode("\n");

        $whatsappUrl = 'https://wa.me/'.$adminWhatsAppNumber.'?text='.rawurlencode($message);

        return back()
            ->with('success', 'Pesanan berhasil disimpan. Silakan kirim pesan WhatsApp untuk meminta konfirmasi.')
            ->with('whatsapp_url', $whatsappUrl);
    }
}
