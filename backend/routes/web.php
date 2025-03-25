<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\JwtMiddleware;

Route::post('/register', [AuthController::class, 'register']); // Rota para registrar um novo usuário
Route::post('/login', [AuthController::class, 'login']); // Rota para fazer login
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api'); // Rota para fazer logout

Route::get('/teste', function () {
    return response()->json(['message' => 'API funcionando!']);
});

Route::get('/', function () {
    return view('welcome');
});

Route::middleware([JwtMiddleware::class])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});