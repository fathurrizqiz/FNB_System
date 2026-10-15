<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluasiModel extends Model
{
    protected $table = 'evaluasi_melted';

    protected $fillable = [
        'name',
        'comment',
    ];
}
