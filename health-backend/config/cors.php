<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Pinapayagan nito ang iyong React frontend (Port 5173)
    'allowed_origins' => ['http://localhost:5173'], 

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Gawin nating true ito para gumana ang user sessions
    'supports_credentials' => true,

];