@extends('layouts.main')
@section('content')

<section>
    <div class="row main-content">
        <div class="col-lg-4 col-xl-3 left-content">
            @include('user.left-content')
        </div>

        <div class="col-lg-8 col-xl-9 right-content" id="right-content">
            {{-- <div>
                <button class="desktop-settings-right-content-close" onclick="desktopNewConversationClose()"><i class="fas fa-times"></i></button>
                <button class="mobile-settings-right-content-back" onclick="mobileNewConversationClose()"><i class="fas fa-chevron-left"></i></button>
            </div>
            <div class="new-conversation-body">
                <h5 class="new-conversation-title">Find users by username to start a conversation.</h5>
                <div class="search-group">
                    <i class="far fa-user search-icon"></i>
                    <input type="text" class="search-input" name="" placeholder="@username...">
                    <button class="search-user"><i class="fas fa-search"></i></button>
                    <div class="three-quarter-spinner"></div>
                </div>
                <div class="search-user-result">
                    <img src="{{ asset('assets/user_picture/'.Auth::user()->picture) }}">
                    <h4>{{ Auth::user()->name }}</h4>
                    <span>{{ Auth::user()->username }}</span>
                    <br>
                    <button class="btn-chat"><i class="fas fa-comment-dots"></i>Direct Message</button>
                    <h4 class="search-user-not-found"><i>User not found</i></h4>
                </div>
            </div> --}}


            <div></div>
            <div class="right-content-landed">
                <img src="{{ asset('assets/img/stay-connected.png') }}" alt="">
                <h4>STAY CONNECTED.</h4>
                <h4>YOUR MESSAGES ARE FULLY ENCRYPTED <i class="fas fa-lock"></i></h4>
            </div>
            <div></div>
        </div>
    </div>
</section>

@endsection

@section('script')
    <script src="{{ asset('assets/js/me.js?v='.filemtime(public_path('assets/js/me.js'))) }}"></script>
@endsection