<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('vitals', function (Blueprint $table) {
        $table->id();
        $table->float('temp');         // Tugma sa hardware
        $table->float('humidity');     // Dating 'hum'
        $table->float('pressure');     // Tugma sa hardware
        $table->integer('pulse_rate'); // Dating 'bpm'
        $table->integer('spo2');       // Tugma sa hardware
        $table->integer('eco2');       // Dating 'co2Level'
        $table->integer('tvoc');       // Tugma sa hardware
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vitals');
    }
};
