<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vital;

class VitalController extends Controller
{
    public function store(Request $request)
    {
        $vital = Vital::create($request->all());
        return response()->json(['status' => 'success', 'data' => $vital], 201);
    }

    public function index()
    {
        return response()->json(Vital::latest()->take(50)->get());
    }
}