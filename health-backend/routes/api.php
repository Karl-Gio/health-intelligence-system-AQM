<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\VitalController;

/*
|--------------------------------------------------------------------------
| Sensor Routes (Existing)
|--------------------------------------------------------------------------
*/
Route::post('/vitals', [VitalController::class, 'store']);
Route::get('/vitals', [VitalController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authentication Routes (Updated)
|--------------------------------------------------------------------------
*/

// Registration: May dagdag na check para sa duplicate users
Route::post('/register', function (Request $request) {
    // 1. Siguraduhin na may laman ang request
    if (!$request->username || !$request->password) {
        return response()->json(['message' => 'Username and password are required'], 400);
    }

    // 2. I-check kung may existing na user na may ganyang pangalan
    $userExists = DB::table('users')->where('username', $request->username)->exists();
    if ($userExists) {
        return response()->json(['message' => 'Username is already taken'], 409);
    }

    // 3. I-save sa database
    try {
        DB::table('users')->insert([
            'username' => $request->username,
            'password' => Hash::make($request->password)
        ]);
        return response()->json(['message' => 'User registered successfully!'], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
    }
});

// Login: Pinatibay ang verification logic
Route::post('/login', function (Request $request) {
    // Hanapin ang user gamit ang username
    $user = DB::table('users')->where('username', $request->username)->first();

    // Verify kung nage-exist ang user at kung tama ang password
    if ($user && Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => true,
            'username' => $user->username
        ], 200);
    }

    // Mas specific na message para sa frontend
    return response()->json([
        'success' => false, 
        'message' => 'Invalid username or password'
    ], 401);
});