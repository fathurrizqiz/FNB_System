<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\OrderMenu;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $order = OrderMenu::query()
            ->with('menu')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Admin/Order/index', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, OrderMenu $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,rejected'],
        ]);

        DB::transaction(function () use ($order, $validated): void {
            $orders = OrderMenu::query();

            if ($order->order_number !== null) {
                $orders->where('order_number', $order->order_number);
            } else {
                $orders->whereKey($order->getKey());
            }

            $voucherIds = $orders->lockForUpdate()
                ->pluck('voucher_id')
                ->filter()
                ->unique();

            $orders->update(['status' => $validated['status']]);

            foreach ($voucherIds as $voucherId) {
                $voucher = Voucher::query()->lockForUpdate()->find($voucherId);

                if ($voucher?->status === 'reserved') {
                    if ($validated['status'] === 'confirmed') {
                        $voucher->update(['status' => 'redeemed']);
                    } elseif ($validated['status'] === 'rejected') {
                        $voucher->update(['status' => 'evaluated']);
                    }
                }
            }
        });

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    public function destroy(OrderMenu $order): RedirectResponse
    {
        DB::transaction(function () use ($order): void {
            $orders = OrderMenu::query();

            if ($order->order_number !== null) {
                $orders->where('order_number', $order->order_number);
            } else {
                $orders->whereKey($order->getKey());
            }

            $voucherIds = $orders->lockForUpdate()
                ->pluck('voucher_id')
                ->filter()
                ->unique();

            foreach ($voucherIds as $voucherId) {
                $voucher = Voucher::query()->lockForUpdate()->find($voucherId);

                if ($voucher?->status === 'reserved') {
                    $voucher->update(['status' => 'evaluated']);
                }
            }

            $orders->delete();
        });

        return back()->with('success', 'Pesanan berhasil dihapus.');
    }
}
