<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MessageController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(['guest'])->group(function () {
    Route::get('/', function(){
        return view('auth.login');
    })->name('index');
    Route::post('/login-attempt', [AuthenticationController::class, 'login_attempt']);
});

Route::get('/create-user', [AuthenticationController::class, 'create_user']);
Route::get('/abc', [UserController::class, 'abc']);

Route::middleware(['auth'])->group(function () {
    Route::get('/me', [UserController::class, 'main']);
    Route::post('/me', [UserController::class, 'post_main']);

    Route::get('/users-connected', [UserController::class, 'users_connected']);
    Route::get('/contact', [UserController::class, 'contact']);
    Route::post('/messages/read/{userid}', [MessageController::class, 'read_message']);

    Route::get('/me/settings', [UserController::class, 'settings']);
    Route::post('/me/settings', [UserController::class, 'post_settings']);

    Route::post('/me/search-user', [UserController::class, 'search_user']);
    Route::post('/me/new-request-action', [UserController::class, 'new_request_action']);

    Route::get('/me/dm/{userid}', [UserController::class, 'dm']);
    Route::post('/me/dm/get-conversation/{userid}', [UserController::class, 'get_conversation']);

    Route::post('/me/typing', [MessageController::class, 'typing']);
    Route::post('/send-message', [MessageController::class, 'send_message']);

    Route::get('/logout', [AuthenticationController::class, 'logout']);
    Route::post('/logout', [AuthenticationController::class, 'post_logout']);
});