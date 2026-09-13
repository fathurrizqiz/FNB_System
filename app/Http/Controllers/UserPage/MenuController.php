<?php

namespace App\Http\Controllers\UserPage;

use App\Http\Controllers\Controller;
use App\Models\MenuModel;
use Illuminate\Http\Request;
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
}
