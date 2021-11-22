<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Str;

class AuthenticationController extends Controller
{
    public function create_user()
    {
        // User::create([
        //     'username' => '@wahyu',
        //     'name' => 'Wahyu Andriyan',
        //     'email' => 'wahyu@gmail.com',
        //     'password' => bcrypt('wahyu12345')
        // ]);
    }

    public function login_attempt(Request $request)
    {
        $email = $request->email;
        $password = $request->password;
        $attempt = Auth::attempt(['email' => $email, 'password' => $password]);

        if ($attempt) {
            return response()->json("Success");
        }else{
            return response()->json("Failed");
        }
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/');
    }

    public function post_logout()
    {
        Auth::logout();
        return view('auth.async.login');
    }
}
