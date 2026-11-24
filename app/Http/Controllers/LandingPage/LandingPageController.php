<?php

namespace App\Http\Controllers\LandingPage;

use App\Http\Controllers\Controller;
use App\Models\EvaluasiModel;
use App\Models\MenuModel;
use App\Models\Outlet;
use App\Models\VoucherCampaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    public function index(Request $request)
    {
        $ratings = EvaluasiModel::query()
            ->whereNotNull('menu_id')
            ->whereNotNull('rating')
            ->selectRaw('menu_id, AVG(rating) as average_rating, COUNT(*) as rating_count')
            ->groupBy('menu_id')
            ->get()
            ->keyBy('menu_id');

        $menuItems = MenuModel::query()
            ->orderBy('name')
            ->get()
            ->map(function (MenuModel $menu) use ($ratings): array {
                $rating = $ratings->get($menu->id);

                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'category' => $menu->category,
                    'description' => $menu->description,
                    'price' => $menu->price,
                    'image' => $menu->image ? '/storage/'.$menu->image : null,
                    'averageRating' => $rating === null ? null : round((float) $rating->average_rating, 1),
                    'ratingCount' => (int) ($rating->rating_count ?? 0),
                ];
            });

        $comments = EvaluasiModel::query()
            ->with('menu:id,name')
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'comment', 'rating', 'menu_id'])
            ->map(fn (EvaluasiModel $evaluation): array => [
                'id' => $evaluation->id,
                'name' => $evaluation->name,
                'comment' => $evaluation->comment,
                'rating' => $evaluation->rating,
                'menuName' => $evaluation->menu?->name,
            ]);

        $outlets = Outlet::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'description', 'phone']);

        $voucherCampaigns = VoucherCampaign::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'discount_type', 'discount_value', 'min_items']);

        return Inertia::render('Landing/landingpage', [
            'menuItems' => $menuItems,
            'comments' => $comments,
            'outlets' => $outlets,
            'voucherCampaigns' => $voucherCampaigns,
            'voucherCode' => $request->session()->get('voucher_code'),
            'whatsappNumber' => config('services.whatsapp.number'),
        ]);
    }
}
