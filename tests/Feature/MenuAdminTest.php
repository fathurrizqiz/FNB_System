<?php

namespace Tests\Feature;

use App\Models\MenuModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_update_a_menu_category(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/admin/menu/create')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Menu/create')
                ->where('categories', MenuModel::CATEGORIES));

        $this->post('/admin/menu', [
            'name' => 'Dimsum Ayam',
            'category' => 'Dimsum',
            'description' => 'Dimsum ayam kukus.',
            'price' => 20000,
        ])
            ->assertRedirect(route('admin.menu.index'))
            ->assertSessionHas('success', 'Menu item created successfully.');

        $menu = MenuModel::query()->sole();

        $this->assertDatabaseHas('Menu', [
            'id' => $menu->id,
            'name' => 'Dimsum Ayam',
            'category' => 'Dimsum',
        ]);

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->where('menuItems.0.category', 'Dimsum'));

        $this->get('/menu')
            ->assertInertia(fn ($page) => $page
                ->where('menu.0.category', 'Dimsum'));

        $this->get("/admin/menu/{$menu->id}/edit")
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Menu/edit')
                ->where('menuItem.category', 'Dimsum')
                ->where('categories', MenuModel::CATEGORIES));

        $this->put("/admin/menu/{$menu->id}", [
            'name' => 'Dimsum Ayam',
            'category' => 'Pisang',
            'description' => 'Menu diperbarui.',
            'price' => 20000,
        ])
            ->assertRedirect(route('admin.menu.index'))
            ->assertSessionHas('success', 'Menu item updated successfully.');

        $this->assertDatabaseHas('Menu', [
            'id' => $menu->id,
            'category' => 'Pisang',
        ]);
    }

    public function test_admin_cannot_create_a_menu_with_an_unknown_category(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->from('/admin/menu/create')
            ->post('/admin/menu', [
                'name' => 'Dimsum Ayam',
                'category' => 'Minuman',
                'price' => 20000,
            ])
            ->assertSessionHasErrors([
                'category' => 'Kategori menu tidak valid.',
            ]);

        $this->assertDatabaseCount('Menu', 0);
    }
}
