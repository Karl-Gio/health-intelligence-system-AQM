<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{
    use HasFactory;

    // Siguraduhing tugma ito sa JSON keys mula sa Arduino: 
    // "temp", "humidity", "pressure", "pulse_rate", "spo2", "eco2", "tvoc"
    protected $fillable = [
        'temp',
        'humidity',
        'pressure',
        'pulse_rate',
        'spo2',
        'eco2',
        'tvoc'
    ];
}