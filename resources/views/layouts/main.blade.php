<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Chat System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('assets/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/font-awesome-pro-master/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/main.css?v='.filemtime(public_path('assets/css/main.css'))) }}">
    <link rel="stylesheet" href="{{ asset('assets/css/authentication.css?v='.filemtime(public_path('assets/css/authentication.css'))) }}">
    <link rel="stylesheet" href="{{ asset('assets/css/animate.css?v='.filemtime(public_path('assets/css/animate.css'))) }}">
    <script src="https://js.pusher.com/7.0/pusher.min.js"></script>
</head>
<body>
    <main class="container" id="main">
        @yield('content')
    </main>

    <script src="{{ asset('assets/js/jquery-3.6.0.min.js') }}"></script>
    <script src="{{ asset('assets/js/bootstrap.min.js') }}"></script>
    <script src="{{ asset('js/app.js') }}"></script>
    <script src="{{ asset('assets/js/main.js?v='.filemtime(public_path('assets/js/main.js'))) }}"></script>
    @yield('script')
</body>
</html>