<?php

namespace App\Http\Controllers\LandingPage;

use App\Http\Controllers\Controller;
use App\Models\EvaluasiModel;
use App\Models\MenuModel;
use App\Models\Outlet;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    public function index()
    {
        $menuItems = MenuModel::query()
            ->orderBy('name')
            ->get()
            ->map(fn (MenuModel $menu): array => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'image' => $menu->image ? '/storage/'.$menu->image : null,
            ]);

        $comments = EvaluasiModel::query()
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'comment']);

        $outlets = Outlet::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'description', 'phone']);

        return Inertia::render('Landing/landingpage', [
            'menuItems' => $menuItems,
            'comments' => $comments,
            'outlets' => $outlets,
            'whatsappNumber' => config('services.whatsapp.number'),
        ]);
    }
}
