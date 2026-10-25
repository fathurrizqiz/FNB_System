<?php

namespace Tests\Feature;

use App\Models\Outlet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutletTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_displays_only_active_outlets(): void
    {
        $activeOutlet = Outlet::query()->create([
            'name' => 'Kantin SMP Harapan',
            'address' => 'Jl. Pendidikan No. 12',
            'description' => 'Dekat gerbang utama.',
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        Outlet::query()->create([
            'name' => 'Outlet Tutup',
            'address' => 'Jl. Lama No. 1',
            'is_active' => false,
        ]);

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->component('Landing/landingpage')
                ->has('outlets', 1)
                ->where('outlets.0.id', $activeOutlet->id)
                ->where('outlets.0.name', 'Kantin SMP Harapan')
                ->where('outlets.0.address', 'Jl. Pendidikan No. 12')
                ->where('outlets.0.phone', '081234567890'));
    }

    public function test_admin_can_create_update_and_delete_outlets(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/admin/outlets')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Outlet/index')
                ->has('outlets', 0));

        $this->get('/admin/outlets/create')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Outlet/create'));

        $this->post('/admin/outlets', [
            'name' => 'Kantin SMP Harapan',
            'address' => 'Jl. Pendidikan No. 12',
            'description' => 'Dekat gerbang utama.',
            'phone' => '081234567890',
            'is_active' => true,
        ])
            ->assertRedirect(route('admin.outlets.index'))
            ->assertSessionHas('success', 'Outlet berhasil ditambahkan.');

        $outlet = Outlet::query()->sole();

        $this->assertDatabaseHas('outlets', [
            'id' => $outlet->id,
            'name' => 'Kantin SMP Harapan',
            'is_active' => true,
        ]);

        $this->get("/admin/outlets/{$outlet->id}/edit")
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Outlet/edit')
                ->where('outlet.id', $outlet->id));

        $this->put("/admin/outlets/{$outlet->id}", [
            'name' => 'Kantin SMA Harapan',
            'address' => 'Jl. Pendidikan No. 20',
            'description' => 'Lantai dua.',
            'phone' => '081234567891',
            'is_active' => false,
            'unexpected_field' => 'ignored',
        ])
            ->assertRedirect(route('admin.outlets.index'))
            ->assertSessionHas('success', 'Outlet berhasil diperbarui.');

        $this->assertDatabaseHas('outlets', [
            'id' => $outlet->id,
            'name' => 'Kantin SMA Harapan',
            'address' => 'Jl. Pendidikan No. 20',
            'is_active' => false,
        ]);
        $this->assertArrayNotHasKey('unexpected_field', $outlet->fresh()->getAttributes());

        $this->delete("/admin/outlets/{$outlet->id}")
            ->assertRedirect(route('admin.outlets.index'))
            ->assertSessionHas('success', 'Outlet berhasil dihapus.');

        $this->assertDatabaseMissing('outlets', ['id' => $outlet->id]);
    }

    public function test_guests_and_non_admin_users_cannot_manage_outlets(): void
    {
        $this->get('/admin/outlets')
            ->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->get('/admin/outlets')
            ->assertForbidden();
    }

    public function test_outlet_creation_requires_a_name_and_address(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->from('/admin/outlets/create')
            ->post('/admin/outlets', [
                'name' => '',
                'address' => '',
                'is_active' => true,
            ])
            ->assertSessionHasErrors([
                'name' => 'Nama outlet wajib diisi.',
                'address' => 'Alamat outlet wajib diisi.',
            ]);

        $this->assertDatabaseCount('outlets', 0);
    }
}
