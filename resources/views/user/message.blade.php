@extends('layouts.main')
@section('content')

<section>
    <div class="row main-content">
        <div class="col-lg-4 col-xl-3 left-content">
            @include('user.left-content')
        </div>

        <div class="col-lg-8 col-xl-9 right-content show" id="right-content">
            @if ($data == null)
                <div></div>
                <div class="right-content-landed">
                    <h4>USER NOT FOUND</h4>
                </div>
                <div></div>
            @else
                <div class="right-content-header">
                    <i class="fas fa-times desktop-right-content-close" onclick="desktopRightContentClose()"></i>
                    <i class="fas fa-chevron-left mobile-right-content-back" onclick="mobileRightContentClose()"></i>
                    <img src="{{ asset('assets/user_picture/'.$data["picture"]) }}" alt="" class="header-img">
                    <h4 class="header-name">{{ $data["name"] }}</h4>
                    <input type="hidden" id="name" value="{{ $data["name"] }}">
                    <input type="hidden" id="userid" value="{{ $data["id"] }}">
                </div>
                <div class="right-content-body conversation-body" id="conversation-{{ $data["id"] }}">
                    
                </div>
                <div class="right-content-footer" id="right-content-footer-{{ $data["id"] }}">
                    
                </div>
            @endif
        </div>
    </div>
</section>

@endsection

@section('script')
    <script src="{{ asset('assets/js/me.js?v='.filemtime(public_path('assets/js/me.js'))) }}"></script>
    <script>
        messageBodyActive = $('#userid').val()
        getConversation(messageBodyActive, $('#name').val())
    </script>
@endsection