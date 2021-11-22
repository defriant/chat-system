@extends('layouts.main')
@section('content')
<section>
    <div class="login-section">
        <div class="login-box">
            <h4 class="login-title">LOG IN TO YOUR ACCOUNT</h4>
            <form id="login-form" onsubmit="loginAttempt(event)">
                <div class="input_group">
                    <i class="fad fa-user input_icon_left"></i>
                    <input type="text" class="input_form input_login" name="email" placeholder="Email" oninput="loginDataInput()">
                </div>
                <div class="input_group">
                    <i class="fad fa-key input_icon_left"></i>
                    <input type="password" class="input_form input_login" name="password" placeholder="Password" oninput="loginDataInput()">
                </div>
                <div class="check-group">
                    <input type="checkbox" class="checkbox" name="remember" id="check">
                    <label class="check-label" for="check">Keep me logged in</label>
                </div>
                <button type="submit" class="button button-block disabled" id="btn-login">
                    Login
                    <i class="fad fa-sign-in-alt button_icon_right"></i>
                </button>
            </form>
            <div class="others">
                <hr>
                <span>OR</span>
                <hr>
            </div>
            <div class="others-login">
                <div class="google-login">
                    <img src="{{ asset('assets/img/google-icon.png') }}">
                    <h4>Login with Google</h4>
                </div>
            </div>
            <div class="forgot-password">
                <a href="#">Forgot password ?</a>
            </div>
            <div class="no-account">
                <h4>Don't have account ?</h4>
                <a href="#">Register Here</a>
            </div>
        </div>
    </div>
</section>
@endsection
