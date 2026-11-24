<?php

use App\Http\Controllers\AdminPage\MenuAdminController;
use App\Http\Controllers\AdminPage\OrderController;
use App\Http\Controllers\AdminPage\OutletAdminController;
use App\Http\Controllers\AdminPage\VoucherCampaignController;
use App\Http\Controllers\AdminPage\VoucherClaimController;
use App\Http\Controllers\Evaluasi\ComentarController;
use App\Http\Controllers\LandingPage\LandingPageController;
use App\Http\Controllers\UserPage\MenuController;
use App\Http\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingPageController::class, 'index'])->name('home');
Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::post('/menu/order', [MenuController::class, 'store'])->name('menu.order');
Route::get('/evaluasi', [ComentarController::class, 'view'])->name('evaluasi.view');
Route::post('/evaluasi', [ComentarController::class, 'store'])->name('evaluasi.store');
Route::post('/vouchers', [VoucherController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('vouchers.store');
Route::get('/voucher/{token}', [VoucherController::class, 'show'])->name('vouchers.show');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('admin')->group(function () {
        Route::get('/admin/vouchers', [VoucherCampaignController::class, 'index'])->name('admin.vouchers.index');
        Route::post('/admin/vouchers/campaigns', [VoucherCampaignController::class, 'store'])
            ->name('admin.vouchers.campaigns.store');
        Route::patch('/admin/vouchers/campaigns/{campaign}', [VoucherCampaignController::class, 'update'])
            ->name('admin.vouchers.campaigns.update');
        Route::post('/admin/vouchers/claim', [VoucherClaimController::class, 'store'])
            ->name('admin.vouchers.claim');

        Route::get('/admin/menu', [MenuAdminController::class, 'index'])->name('admin.menu.index');
        Route::get('/admin/menu/create', [MenuAdminController::class, 'create'])->name('admin.menu.create');
        Route::post('/admin/menu', [MenuAdminController::class, 'store'])->name('admin.menu.store');
        Route::get('/admin/menu/{id}/edit', [MenuAdminController::class, 'edit'])->name('admin.menu.edit');
        Route::put('/admin/menu/{id}', [MenuAdminController::class, 'update'])->name('admin.menu.update');
        Route::delete('/admin/menu/{id}', [MenuAdminController::class, 'destroy'])->name('admin.menu.destroy');

        Route::resource('/admin/outlets', OutletAdminController::class)
            ->except('show')
            ->names('admin.outlets');

        Route::get('/admin/orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::patch('/admin/orders/{order}/status', [OrderController::class, 'update'])->name('admin.orders.update');
        Route::delete('/admin/orders/{order}', [OrderController::class, 'destroy'])->name('admin.orders.destroy');
    });
});

require __DIR__.'/settings.php';
