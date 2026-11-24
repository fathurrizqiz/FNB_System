<?php

namespace App\Http\Controllers\Evaluasi;

use App\Http\Controllers\Controller;
use App\Models\EvaluasiModel;
use App\Models\MenuModel;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ComentarController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'comment' => [
                Rule::requiredIf(! $request->filled('voucher_token')),
                'nullable',
                'string',
                'max:1000',
            ],
            'voucher_token' => ['nullable', 'string', 'size:64'],
            'menu_id' => [
                Rule::requiredIf($request->filled('voucher_token')),
                'nullable',
                'integer',
                'exists:Menu,id',
            ],
            'rating' => [
                Rule::requiredIf($request->filled('voucher_token')),
                'nullable',
                'integer',
                'between:1,5',
            ],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama maksimal 50 karakter.',
            'comment.required' => 'Komentar wajib diisi.',
            'comment.max' => 'Komentar maksimal 1000 karakter.',
            'menu_id.required' => 'Pilih produk yang ingin dinilai.',
            'rating.required' => 'Pilih rating bintang 1 sampai 5.',
        ]);

        $voucherToken = $validated['voucher_token'] ?? null;

        if ($voucherToken === null) {
            EvaluasiModel::query()->create([
                'name' => $validated['name'],
                'comment' => $validated['comment'] ?? '',
            ]);

            return redirect()
                ->route('evaluasi.view')
                ->with('success', 'Terima kasih! Komentar Anda berhasil dikirim.');
        }

        DB::transaction(function () use ($validated, $voucherToken): void {
            $voucher = Voucher::query()
                ->where('token_hash', hash('sha256', $voucherToken))
                ->lockForUpdate()
                ->first();

            if (! $voucher || $voucher->status !== 'claimed') {
                throw ValidationException::withMessages([
                    'voucher_token' => 'Voucher ini tidak dapat digunakan untuk mengirim evaluasi.',
                ]);
            }

            EvaluasiModel::query()->create([
                'name' => $validated['name'],
                'comment' => $validated['comment'] ?? '',
                'menu_id' => $validated['menu_id'],
                'rating' => $validated['rating'],
                'voucher_id' => $voucher->id,
            ]);

            $voucher->update(['status' => 'evaluated']);
        });

        return redirect()
            ->route('home')
            ->with('success', 'Terima kasih! Evaluasi tersimpan dan voucher siap digunakan.')
            ->with('voucher_code', $voucherToken);
    }

    public function view(Request $request): Response
    {
        $voucherToken = $request->query('voucher');
        $menus = [];

        if ($voucherToken !== null) {
            abort_unless(is_string($voucherToken) && strlen($voucherToken) === 64, 404);

            $voucher = Voucher::query()
                ->where('token_hash', hash('sha256', $voucherToken))
                ->firstOrFail();

            abort_unless($voucher->status === 'claimed', 404);

            $menus = MenuModel::query()
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        return Inertia::render('Landing/evaluasi', [
            'voucherToken' => $voucherToken,
            'menus' => $menus,
        ]);
    }
}
