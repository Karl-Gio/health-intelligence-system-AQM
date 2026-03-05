<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{
    use HasFactory;

    // Ito ang listahan ng mga columns na pwede nating "ma-fill" ng data
    protected $fillable = [
        'bpm', 
        'spo2', 
        'co2Level', 
        'tvoc', 
        'temp', 
        'hum', 
        'pressure'
    ];
}