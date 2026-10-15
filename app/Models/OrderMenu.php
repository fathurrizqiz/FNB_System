<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $menu_id
 * @property int $quantity
 * @property string|null $customer_name
 * @property string|null $whatsapp_number
 * @property string|null $delivery_method
 * @property string|null $notes
 * @property string|null $unit_price
 * @property string|null $order_number
 * @property string|null $status
 */
class OrderMenu extends Model
{
    protected $table = 'order_menu';

    protected $fillable = [
        'menu_id',
        'quantity',
        'customer_name',
        'whatsapp_number',
        'delivery_method',
        'notes',
        'unit_price',
        'order_number',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(MenuModel::class, 'menu_id');
    }
}
