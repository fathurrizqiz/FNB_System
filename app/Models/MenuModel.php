<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $category
 * @property string|null $description
 * @property string $price
 * @property string|null $image
 */
class MenuModel extends Model
{
    public const CATEGORIES = ['Pisang', 'Dimsum'];

    protected $table = 'Menu';

    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'image',
    ];

    public function orderMenus(): HasMany
    {
        return $this->hasMany(OrderMenu::class, 'menu_id');
    }
}
