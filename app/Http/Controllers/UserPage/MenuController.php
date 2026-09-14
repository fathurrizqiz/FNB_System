<?php

namespace App\Http\Controllers\UserPage;

use App\Http\Controllers\Controller;
use App\Models\MenuModel;
use App\Models\OrderMenu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:Menu,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.whatsapp_number' => ['nullable', 'string'],
            'items.*.order_number' => ['nullable', 'string'],
            'items.*.status' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated): void {
            foreach ($validated['items'] as $item) {
                OrderMenu::create([
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'whatsapp_number' => $item['whatsapp_number'] ?? null,
                    'order_number' => $item['order_number'] ?? null,
                    'status' => 'pending',
                ]);
            }
        });

        return redirect()->back()->with('success', 'Order submitted successfully.');
    }
}
