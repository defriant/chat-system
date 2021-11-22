@extends('layouts.main')
@section('content')

<section>
    <div class="row main-content">
        <div class="col-lg-4 col-xl-3 left-content">
            @include('user.left-content')
        </div>

        <div class="col-lg-8 col-xl-9 right-content show right-content-user-settings" id="right-content">
            <div class="settings-header">
                <button class="desktop-settings-right-content-close" onclick="desktopRightContentClose()"><i class="fas fa-times"></i></button>
                <button class="mobile-settings-right-content-back" onclick="mobileRightContentClose()"><i class="fas fa-chevron-left"></i></button>
            </div>
            <div class="right-content-setting">
                <img src="{{ asset('assets/user_picture/'.Auth::user()->picture) }}" class="setting-profile-pict">
                <h4 class="setting-profile-name">{{ Auth::user()->name }}</h4>
                <span class="setting-profile-username">{{ Auth::user()->username }}</span>
            </div>
            <div class="settings-footer">
                <button class="btn-sign-out" onclick="userLogout()">
                    <i class="fad fa-sign-out-alt sign-out-icon"></i>Logout
                </button>
            </div>
        </div>
    </div>
</section>

@endsection

@section('script')
    <script src="{{ asset('assets/js/me.js?v='.filemtime(public_path('assets/js/me.js'))) }}"></script>
@endsection