<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash; //criptografa senhas
use Tymon\JWTAuth\Facades\JWTAuth;  
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller
{
    //Registra um novo usuário
    public function register(Request $request){

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6'
        ]);

        if($validator->fails()){
            return response()->json($validator->errors()->toJson(), 400);
        }


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message', 'Usuário criado com sucesso!'],201);
    }

    //Login
    public function login(Request $request){
        $credentials = $request->only('email', 'password');

        if(!$token = JWTAuth::attempt($credentials)){
            return response()->json(['message' => 'Credenciais inválidas!'],401);
        }

        return response()->json(['token' => $token]);
    }

    // Fazer logout
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Logout realizado com sucesso!']);
    }
}
