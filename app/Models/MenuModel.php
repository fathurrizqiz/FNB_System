<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuModel extends Model
{
    protected $table = 'Menu';

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
    ];

    public function orderMenus(): HasMany
    {
        return $this->hasMany(OrderMenu::class, 'menu_id');
    }
}
