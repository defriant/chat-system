<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use App\Models\User;
use App\Models\Message;
use App\Models\Contact;
use App\Events\NewRequest;

class UserController extends Controller
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

    public function abc()
    {
        Message::where('from', 2)->where('to', 4)->orWhere('from', 4)->where('to', 2)->delete();
    }
    
    public function main()
    {
        return view('user.index');
    }

    public function post_main()
    {
        return view('user.async.index');
    }

    public function users_connected()
    {
        $data = User::all();
        return response()->json($data);
    }

    public function contact()
    {
        $contact = Contact::where('id_user', Auth::user()->id)->get();
        $data = [];
        foreach ($contact as $c) {
            $conversation = Message::where('from', $c->user->id)->where('to', Auth::user()->id)->orWhere('from', Auth::user()->id)->where('to', $c->user->id)->orderBy('id', 'DESC')->first();
            if ($conversation != null) {
                $lastConversation = date('Y-m-d', strtotime($conversation->created_at));
                $lastMessageDate = date('Y-m-d H:i:s', strtotime($conversation->created_at));
                if ($lastConversation == date('Y-m-d')) {
                    $lastMessage = "Today";
                }else{
                    $lastMessage = date('d/m/Y', strtotime($conversation->created_at));
                }
            }else{
                $lastMessage = '';
                $lastMessageDate = '';
            }

            $messageUnread = Message::where('from', $c->user->id)->where('to', Auth::user()->id)->where('is_read', 0)->get();
            $messageUnread = count($messageUnread);

            $encryptedId = openssl_encrypt($c->user->id, $this->cipher, $this->key, 0, $this->iv);
            $encryptedId = base64_encode($encryptedId);
            $dataContact = [
                "id" => $encryptedId,
                "userId" => $c->user->id,
                "username" => $c->user->username,
                "name" => $c->user->name,
                "picture" => asset('assets/user_picture/'.$c->user->picture),
                "lastMessageDate" => $lastMessageDate,
                "lastMessage" => $lastMessage,
                "messageUnread" => $messageUnread,
                "connection" => $c->connection
            ];
            $data[] = $dataContact;
        }

        usort($data, function($a, $b){
            return strtotime($b["lastMessageDate"]) - strtotime($a["lastMessageDate"]);
        });

        return response()->json($data);
    }

    public function settings()
    {
        return view('user.settings');
    }

    public function post_settings()
    {
        return view('user.async.settings');
    }

    public function search_user(Request $request)
    {
        $user = User::where('username', $request->username)->where('username', '!=', Auth::user()->username)->first();
        if ($user) {
            $encryptId = openssl_encrypt($user->id, $this->cipher, $this->key, 0, $this->iv);
            $encryptId = base64_encode($encryptId);
            $response = [
                'userId' => $user->id,
                'id' => $encryptId,
                'picture' => asset('assets/user_picture/'.$user->picture),
                'name' => $user->name,
                'username' => $user->username
            ];
        }else{
            $response = 'userNotFound';
        }

        return response()->json($response);
    }

    public function new_request_action(Request $request)
    {
        $from = openssl_encrypt(Auth::user()->id, $this->cipher, $this->key, 0, $this->iv);
        $from = base64_encode($from);
        $to = openssl_decrypt(base64_decode($request->userid), $this->cipher, $this->key, 0, $this->iv);
        $action = $request->action;

        event(new NewRequest($from, $to, $action));

        if ($action == 'accept') {
            Contact::where('id_user', Auth::user()->id)->where('id_contact', $to)->update([
                'connection' => 'connected'
            ]);
            Contact::where('id_user', $to)->where('id_contact', Auth::user()->id)->update([
                'connection' => 'connected'
            ]);
        }elseif ($action == 'block') {
            Contact::where('id_user', Auth::user()->id)->where('id_contact', $to)->update([
                'connection' => 'block'
            ]);
            Contact::where('id_user', $to)->where('id_contact', Auth::user()->id)->update([
                'connection' => 'blocked'
            ]);
        }elseif ($action == 'cancel_block') {
            Contact::where('id_user', Auth::user()->id)->where('id_contact', $to)->update([
                'connection' => 'connected'
            ]);
            Contact::where('id_user', $to)->where('id_contact', Auth::user()->id)->update([
                'connection' => 'connected'
            ]);
        }

        return response()->json($action);
    }

    public function dm($userid)
    {
        $user = User::find($userid);
        Message::where('from', $userid)->where('to', Auth::user()->id)->where('is_read', 0)->update([
            'is_read' => 1
        ]);
        
        if ($user != null) {
            $encryptedId = openssl_encrypt($user->id, $this->cipher, $this->key, 0, $this->iv);
            $encryptedId = base64_encode($encryptedId);
            $data = [
                "id" => $encryptedId,
                "userId" => $user->id,
                "username" => $user->username,
                "name" => $user->name,
                "picture" => $user->picture
            ];
        }else{
            $data = null;
        }

        return view('user.message', compact('data'));
    }

    public function get_conversation($userid)
    {
        $userid = openssl_decrypt(base64_decode($userid), $this->cipher, $this->key, 0, $this->iv);
        $message = [
            "messages" => []
        ];
        
        $connection = Contact::where('id_user', Auth::user()->id)->where('id_contact', $userid)->first();
        if ($connection) {
            $message["connection"] = $connection->connection;
        }else{
            $message["connection"] = "notConnected";
        }
        
        $getMessage = Message::where('from', $userid)->where('to', Auth::user()->id)->orWhere('from', Auth::user()->id)->where('to', $userid)->orderBy('created_at', 'DESC')->paginate(20);
        foreach ($getMessage as $dataMessage) {
            $message["messages"][] = [
                "from" => $dataMessage->from,
                "message" => Crypt::decrypt($dataMessage->message),
                "date" => date('Y-m-d', strtotime($dataMessage->created_at)),
                "time" => date('H.i', strtotime($dataMessage->created_at)),
                "datetime" => $dataMessage->created_at
            ];
        }

        $message["currentPage"] = $getMessage->currentPage();
        $message["hasMorePage"] = $getMessage->hasMorePages();
        $message["nextPageUrl"] = $getMessage->nextPageUrl();

        usort($message["messages"], function($a, $b){
            return strtotime($a["datetime"]) - strtotime($b["datetime"]);
        });

        return response()->json($message);
    }
}
