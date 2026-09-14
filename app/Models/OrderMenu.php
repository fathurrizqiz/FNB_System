<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMenu extends Model
{
    protected $table = 'order_menu';

    protected $fillable = [
        'menu_id',
        'quantity',
        'whatsapp_number',
        'order_number',
        'status',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(MenuModel::class, 'menu_id');
    }
}
