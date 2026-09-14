<?php

namespace App\Http\Controllers\AdminPage;

use App\Http\Controllers\Controller;
use App\Models\OrderMenu;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $order = OrderMenu::with('menu')->get();

        return Inertia::render('Admin/Order/index', [
            'order' => $order,
        ]);
    }
}
