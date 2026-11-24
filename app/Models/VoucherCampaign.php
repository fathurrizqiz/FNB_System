<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class VoucherCampaign extends Model
{
    protected $fillable = [
        'name',
        'discount_type',
        'discount_value',
        'min_items',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_items' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class);
    }
}
