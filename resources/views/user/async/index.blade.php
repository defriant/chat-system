<section>
    <div class="row main-content">
        <div class="col-lg-4 col-xl-3 left-content">
            @include('user.left-content')
        </div>

        <div class="col-lg-8 col-xl-9 right-content" id="right-content">
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

{{-- <script>
    $.getScript("{{ asset('assets/js/me.js?v='.filemtime(public_path('assets/js/me.js'))) }}")
</script> --}}