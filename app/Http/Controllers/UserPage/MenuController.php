<?php

namespace App\Http\Controllers\UserPage;

use App\Http\Controllers\Controller;
use App\Models\MenuModel;
use App\Models\OrderMenu;
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

        $orderNumber = 'MB-'.Str::upper((string) Str::ulid());
        $orderLines = DB::transaction(function () use ($validated, $orderNumber): array {
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

            $orderLines = [];

            foreach ($validated['items'] as $item) {
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
                ]);

                $orderLines[] = [
                    'order' => $order,
                    'menu_name' => $menu->name,
                ];
            }

            return $orderLines;
        });

        $total = collect($orderLines)->sum(
            fn (array $line): float => (float) $line['order']->unit_price * $line['order']->quantity,
        );

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
            '*Total estimasi:* Rp '.number_format($total, 0, ',', '.'),
            '',
            'Mohon konfirmasi ketersediaan dan pesanan saya. Terima kasih!',
        ])->filter()->implode("\n");

        $adminWhatsAppNumber = (string) preg_replace('/\D+/', '', (string) config('services.whatsapp.number'));

        if ($adminWhatsAppNumber === '') {
            throw new \RuntimeException('Nomor WhatsApp admin belum dikonfigurasi.');
        }

        $whatsappUrl = 'https://wa.me/'.$adminWhatsAppNumber.'?text='.rawurlencode($message);

        return back()
            ->with('success', 'Pesanan berhasil disimpan. Silakan kirim pesan WhatsApp untuk meminta konfirmasi.')
            ->with('whatsapp_url', $whatsappUrl);
    }
}
