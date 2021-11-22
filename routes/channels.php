<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user-connect', function ($user) {
    $cipher = env('ENC_CIPHER');
    $key = env('ENC_KEY');
    $iv = env('ENC_IV');

    $userEncryptedId = openssl_encrypt($user->id, $cipher, $key, 0, $iv);
    $userEncryptedId = base64_encode($userEncryptedId);
    $user = [
        "id" => $userEncryptedId
    ];
    return $user;
});
