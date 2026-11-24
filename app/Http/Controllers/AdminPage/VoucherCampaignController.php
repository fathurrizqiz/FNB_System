<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\VoucherCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VoucherCampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = VoucherCampaign::query()
            ->withCount('vouchers')
            ->latest()
            ->get();

        $vouchers = Voucher::query()
            ->with(['campaign:id,name', 'claimedBy:id,name'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Voucher $voucher): array => [
                'id' => $voucher->id,
                'customer_phone' => $voucher->customer_phone,
                'status' => $voucher->status,
                'campaign' => $voucher->campaign?->name,
                'claimed_by' => $voucher->claimedBy?->name,
                'created_at' => $voucher->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Voucher/index', [
            'campaigns' => $campaigns,
            'vouchers' => $vouchers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'discount_type' => ['required', Rule::in(['fixed', 'percentage'])],
            'discount_value' => [
                'required',
                'numeric',
                'gt:0',
                'max:99999999',
                Rule::when($request->input('discount_type') === 'percentage', ['lte:100']),
            ],
            'min_items' => ['required', 'integer', 'between:2,100'],
        ], [
            'min_items.between' => 'Jumlah minimum pembelian harus 2 sampai 100 item.',
        ]);

        VoucherCampaign::query()->create([
            ...$validated,
            'is_active' => true,
        ]);

        return back()->with('success', 'Promo voucher berhasil dibuat.');
    }

    public function update(Request $request, VoucherCampaign $campaign): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $campaign->update($validated);

        return back()->with('success', 'Status promo berhasil diperbarui.');
    }
}
