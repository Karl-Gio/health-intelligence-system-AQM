<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vital;
use Illuminate\Support\Facades\Cache; // ETO ANG PINAKA-IMPORTANTE PARA SA LIVE DATA

class VitalController extends Controller
{
    // 1. Tumatanggap ng data mula sa ESP32 at itinatago lang sa RAM (Walang DB bloat)
    public function updateLive(Request $request)
    {
        // Ise-save ang data pansamantala sa Cache
        Cache::put('live_vitals', $request->all());
        
        // Iba ang code na ibabalik natin (200) para alam mong Live Sync lang ito
        return response()->json(['status' => 'Live data updated'], 200);
    }

    // 2. Ibibigay sa React Dashboard para sa Real-Time UI (Mabilis!)
    public function getLive()
    {
        // Kukunin ang huling data sa Cache. Kung empty, ibabalik ang empty array []
        return response()->json(Cache::get('live_vitals', []));
    }

    // 3. Ti-trigger ng "Save to Database" Button mo sa React
    public function saveToDb()
    {
        $data = Cache::get('live_vitals');
        
        // Kung may live data, saka lang isusulat sa MySQL table mo
        if ($data) {
            $vital = Vital::create($data);
            return response()->json(['status' => 'success', 'data' => $vital], 201);
        }
        
        return response()->json(['status' => 'No live data to save'], 400);
    }

    // 4. Kumukuha ng LAHAT ng na-save na data para sa Historical Logs
    public function index()
    {
        // Tinanggal na natin ang ->take(50) para makuha ang buong history sa database
        return response()->json(Vital::latest()->get());
    }
}