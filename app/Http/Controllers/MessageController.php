<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use App\Models\User;
use App\Models\Message;
use App\Models\Contact;
use App\Events\SendMessage;
use App\Events\UserTyping;
use App\Events\NewRequest;

class MessageController extends Controller
{
    protected $cipher;
    protected $key;
    protected $iv;

    public function __construct()
    {
        $this->cipher = env('ENC_CIPHER');
        $this->key = env('ENC_KEY');
        $this->iv = env('ENC_IV');
    }

    public function typing(Request $request)
    {
        $name = Auth::user()->name;
        $typing = openssl_encrypt(Auth::user()->id, $this->cipher, $this->key, 0, $this->iv);
        $typing = base64_encode($typing);
        $typingTo = openssl_decrypt(base64_decode($request->typingTo), $this->cipher, $this->key, 0, $this->iv);

        event(new UserTyping($name, $typing, $typingTo));
    }

    public function send_message(Request $request)
    {
        $fromUser = Auth::user()->id;
        $toUser = openssl_decrypt(base64_decode($request->id), $this->cipher, $this->key, 0, $this->iv);
        
        $from = openssl_encrypt(Auth::user()->id, $this->cipher, $this->key, 0, $this->iv);
        $from = base64_encode($from);
        $to = $toUser;
        $message = $request->message;
        $created = date('Y-m-d H:i:s', strtotime($request->created));

        Message::create([
            'from' => $fromUser,
            'to' => $toUser,
            'message' => Crypt::encrypt($message),
            'is_read' => 0,
            'created_at' => $created
        ]);

        $created = date('H.i', strtotime($created));
        event(new SendMessage($from, $to, $message, $created));

        $conversation = Message::where('from', $toUser)->where('to', Auth::user()->id)->orWhere('from', Auth::user()->id)->where('to', $toUser)->orderBy('id', 'DESC')->first();
        if ($conversation != null) {
            $lastConversation = date('Y-m-d', strtotime($conversation->created_at));
            if ($lastConversation == date('Y-m-d')) {
                $lastMessage = "Today";
            }else{
                $lastMessage = date('d/m/Y', strtotime($conversation->created_at));
            }
        }else{
            $lastMessage = '';
        }

        $response = [
            "connection" => '',
            "created" => $created,
            "lastMessage" => $lastMessage
        ];

        $connection = Contact::where('id_user', Auth::user()->id)->where('id_contact', $toUser)->first();
        if ($connection) {
            $response["connection"] = $connection->connection;
        }else{
            $response["connection"] = "notConnected";
            Contact::create([
                'id_user' => Auth::user()->id,
                'id_contact' => $toUser,
                'connection' => 'request'
            ]);
            Contact::create([
                'id_user' => $toUser,
                'id_contact' => Auth::user()->id,
                'connection' => 'new_request'
            ]);

            $action = "new_request";
            event(new NewRequest($from, $to, $action));
        }

        return response()->json($response);
    }

    public function read_message($userid)
    {
        $userid = openssl_decrypt(base64_decode($userid), $this->cipher, $this->key, 0, $this->iv);
        $conversation = Message::where('from', $userid)->where('to', Auth::user()->id)->orWhere('from', Auth::user()->id)->where('to', $userid)->orderBy('id', 'DESC')->first();

        if ($conversation != null) {
            $lastConversation = date('Y-m-d', strtotime($conversation->created_at));
            if ($lastConversation == date('Y-m-d')) {
                $lastMessage = "Today";
            }else{
                $lastMessage = date('d/m/Y', strtotime($conversation->created_at));
            }
        }else{
            $lastMessage = '';
        }

        Message::where('from', $userid)->where('to', Auth::user()->id)->where('is_read', 0)->update([
            'is_read' => 1
        ]);

        return response()->json($lastMessage);
    }
}
