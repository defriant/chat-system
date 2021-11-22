<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;
    protected $table = 'contact';
    protected $fillable = [
        'id_user',
        'id_contact',
        'connection'
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'id_contact');
    }
}
