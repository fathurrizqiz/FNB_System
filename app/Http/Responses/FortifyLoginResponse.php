<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse;
use Symfony\Component\HttpFoundation\Response;

class FortifyLoginResponse implements LoginResponse
{
    public function toResponse($request): Response
    {
        if ($request->user()?->getAttribute('role') !== 'admin') {
            Auth::guard(config('fortify.guard'))->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Akun ini tidak memiliki akses admin.',
                ], 403);
            }

            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Akun ini tidak memiliki akses admin.']);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'redirect' => route('admin.vouchers.index'),
            ]);
        }

        return redirect()->intended(route('admin.vouchers.index'));
    }
}
