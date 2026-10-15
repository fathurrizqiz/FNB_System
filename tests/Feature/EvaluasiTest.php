<?php

namespace Tests\Feature;

use App\Models\EvaluasiModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluasiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_the_comment_form(): void
    {
        $this->get('/evaluasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Landing/evaluasi'));
    }

    public function test_guest_can_submit_a_comment(): void
    {
        $response = $this->from('/evaluasi')->post('/evaluasi', [
            'name' => 'Budi Santoso',
            'comment' => 'Pisang cokelatnya enak dan fresh.',
        ]);

        $response->assertRedirect('/evaluasi');
        $response->assertSessionHas(
            'success',
            'Terima kasih! Komentar Anda berhasil dikirim.',
        );
        $this->assertDatabaseHas('evaluasi_melted', [
            'name' => 'Budi Santoso',
            'comment' => 'Pisang cokelatnya enak dan fresh.',
        ]);
    }

    public function test_comment_submission_requires_a_name_and_comment(): void
    {
        $this->from('/evaluasi')
            ->post('/evaluasi', [])
            ->assertSessionHasErrors([
                'name' => 'Nama wajib diisi.',
                'comment' => 'Komentar wajib diisi.',
            ]);

        $this->assertDatabaseCount('evaluasi_melted', 0);
    }

    public function test_comment_submission_rejects_comments_over_one_thousand_characters(): void
    {
        $this->from('/evaluasi')
            ->post('/evaluasi', [
                'name' => 'Budi Santoso',
                'comment' => str_repeat('a', 1001),
            ])
            ->assertSessionHasErrors([
                'comment' => 'Komentar maksimal 1000 karakter.',
            ]);

        $this->assertDatabaseCount('evaluasi_melted', 0);
    }

    public function test_landing_page_displays_saved_comments(): void
    {
        $comment = EvaluasiModel::query()->create([
            'name' => 'Budi Santoso',
            'comment' => 'Pisang cokelatnya enak dan fresh.',
        ]);

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->component('Landing/landingpage')
                ->has('comments', 1)
                ->where('comments.0.id', $comment->id)
                ->where('comments.0.name', 'Budi Santoso')
                ->where('comments.0.comment', 'Pisang cokelatnya enak dan fresh.'));
    }
}
