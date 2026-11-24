<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluasiModel extends Model
{
    protected $table = 'evaluasi_melted';

    protected $fillable = [
        'name',
        'comment',
        'menu_id',
        'rating',
        'voucher_id',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(MenuModel::class, 'menu_id');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }
}
