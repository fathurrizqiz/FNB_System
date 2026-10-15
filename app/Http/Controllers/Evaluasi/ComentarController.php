<?php

namespace App\Http\Controllers\Evaluasi;

use App\Http\Controllers\Controller;
use App\Models\EvaluasiModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComentarController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'comment' => ['required', 'string', 'max:1000'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama maksimal 50 karakter.',
            'comment.required' => 'Komentar wajib diisi.',
            'comment.max' => 'Komentar maksimal 1000 karakter.',
        ]);

        EvaluasiModel::create($validated);

        return redirect()
            ->route('evaluasi.view')
            ->with('success', 'Terima kasih! Komentar Anda berhasil dikirim.');
    }

    public function view(): Response
    {
        return Inertia::render('Landing/evaluasi');
    }
}
