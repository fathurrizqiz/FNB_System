<?php

use App\Http\Controllers\AdminPage\MenuAdminController;
use App\Http\Controllers\LandingPage\LandingPageController;
use App\Http\Controllers\UserPage\MenuController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingPageController::class, 'index'])->name('home');
Route::get('/menu', [MenuController::class, 'index'])->name('menu');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('/admin/menu', [MenuAdminController::class, 'index'])->name('admin.menu.index');
    Route::get('/admin/menu/create', [MenuAdminController::class, 'create'])->name('admin.menu.create');
    Route::post('/admin/menu', [MenuAdminController::class, 'store'])->name('admin.menu.store');
    Route::get('/admin/menu/{id}/edit', [MenuAdminController::class, 'edit'])->name('admin.menu.edit');
    Route::put('/admin/menu/{id}', [MenuAdminController::class, 'update'])->name('admin.menu.update');
    Route::delete('/admin/menu/{id}', [MenuAdminController::class, 'destroy'])->name('admin.menu.destroy');

});

require __DIR__.'/settings.php';
