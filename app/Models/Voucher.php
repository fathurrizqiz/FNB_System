<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Voucher extends Model
{
    protected $fillable = [
        'voucher_campaign_id',
        'customer_phone',
        'token_hash',
        'status',
        'claimed_by',
        'claimed_at',
    ];

    protected $hidden = [
        'customer_phone',
        'token_hash',
    ];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
        ];
    }

    public static function normalizePhone(string $phone): string
    {
        $digits = (string) preg_replace('/\D+/', '', $phone);

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '8')) {
            return '62'.$digits;
        }

        return $digits;
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(VoucherCampaign::class, 'voucher_campaign_id');
    }

    public function claimedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }

    public function evaluation(): HasOne
    {
        return $this->hasOne(EvaluasiModel::class);
    }
}
