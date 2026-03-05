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
        $table->integer('bpm');           // Pulse Rate
        $table->integer('spo2');          // Oxygen Level
        $table->float('co2Level', 8, 2);  // eCO2 (Estimated)
        $table->float('tvoc', 8, 2);      // TVOC Level (Dito papasok yung bago)
        $table->float('temp', 8, 2);      // Temperature
        $table->float('hum', 8, 2);       // Humidity
        $table->float('pressure', 8, 2);  // Atmospheric Pressure
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
