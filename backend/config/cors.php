<?php

return [
    'paths' => ['api/*'], // Define quais rotas aceitam requisições CORS
    'allowed_methods' => ['*'], // Permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc.)
    'allowed_origins' => ['*'], // Permite requisições de qualquer origem (pode restringir se necessário)
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // Permite todos os headers
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // Defina como true se precisar de autenticação via cookies
];
