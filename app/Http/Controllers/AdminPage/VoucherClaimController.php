<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoucherClaimController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'size:64'],
        ]);

        DB::transaction(function () use ($validated, $request): void {
            $voucher = Voucher::query()
                ->with('campaign')
                ->where('token_hash', hash('sha256', $validated['token']))
                ->lockForUpdate()
                ->first();

            if (! $voucher || $voucher->status !== 'issued' || ! $voucher->campaign?->is_active) {
                throw ValidationException::withMessages([
                    'token' => 'QR tidak valid, sudah diklaim, atau promonya tidak aktif.',
                ]);
            }

            $voucher->update([
                'status' => 'claimed',
                'claimed_by' => $request->user()->id,
                'claimed_at' => now(),
            ]);
        });

        return back()->with('success', 'Voucher berhasil diklaim. Pelanggan dapat melanjutkan evaluasi.');
    }
}
