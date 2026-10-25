<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OutletAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Outlet/index', [
            'outlets' => Outlet::query()->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Outlet/create');
    }

    public function store(Request $request): RedirectResponse
    {
        Outlet::query()->create($this->validatedData($request));

        return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil ditambahkan.');
    }

    public function edit(Outlet $outlet): Response
    {
        return Inertia::render('Admin/Outlet/edit', [
            'outlet' => $outlet,
        ]);
    }

    public function update(Request $request, Outlet $outlet): RedirectResponse
    {
        $outlet->update($this->validatedData($request));

        return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil diperbarui.');
    }

    public function destroy(Outlet $outlet): RedirectResponse
    {
        $outlet->delete();

        return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil dihapus.');
    }

    /**
     * @return array{name: string, address: string, description: string|null, phone: string|null, is_active: bool}
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Nama outlet wajib diisi.',
            'address.required' => 'Alamat outlet wajib diisi.',
            'is_active.required' => 'Status outlet wajib dipilih.',
        ]);
    }
}
