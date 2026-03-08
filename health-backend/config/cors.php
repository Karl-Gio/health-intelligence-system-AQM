<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    // Pinapayagan ang lahat ng routes sa ilalim ng /api/*
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Pinapayagan ang lahat ng HTTP methods (GET, POST, PUT, DELETE)
    'allowed_methods' => ['*'],

    // PINAKA-IMPORTANTE: Pinapayagan ang lahat ng origins
    // Gagamit tayo ng '*' para ma-access mo ito sa phone at laptop IP
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    // Pinapayagan ang lahat ng headers
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Naka-set sa false muna para hindi magka-conflict sa wildcard origins
    'supports_credentials' => false,

];