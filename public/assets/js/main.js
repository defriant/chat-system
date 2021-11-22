window.addEventListener('popstate', function(){
    window.location.href = location.href
})

const csrfToken = $('meta[name="csrf-token"]').attr('content')

$.ajaxSetup({
    headers:{
        'X-CSRF-TOKEN': csrfToken
    }
});

function loginDataInput() {
    let email = $('input[name="email"]').val()
    let emailValidation = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    let password = $('input[name="password"]').val()
    
    if (email.length > 0) {
        if (emailValidation.test(email)) {
            if (password.length > 0) {
                if (password.length >= 6) {
                    $('#btn-login').removeClass('disabled')
                }else{
                    $('#btn-login').addClass('disabled')
                }
            }else{
                $('#btn-login').addClass('disabled')
            }
        }else{
            $('#btn-login').addClass('disabled')
        }
    }else{
        $('#btn-login').addClass('disabled')
    }
}

function loginAttempt(e) {
    e.preventDefault()
    let loginEmail = $('input[name="email"]').val()
    let emailValidation = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    let loginPassword = $('input[name="password"]').val()
    
    if (loginEmail.length > 0) {
        if (emailValidation.test(loginEmail)) {
            if (loginPassword.length > 0) {
                if (loginPassword.length >= 6) {
                    $.ajax({
                        type:'post',
                        url:'/login-attempt',
                        data:{
                            email:loginEmail,
                            password:loginPassword
                        },
                        cache:false,
                        success:function(response){
                            if (response === 'Success') {
                                $.ajax({
                                    type:'post',
                                    url:'/me',
                                    cache:false,
                                    contentType:false,
                                    processData:false,
                                    success:function(data){
                                        $('#main').empty()
                                        $('#main').html(data)
                                        history.pushState('', '', '/me')
                                        $.getScript('assets/js/me.js')
                                    }
                                })
                            }else if(response === 'Failed'){
                                alert('Login Failed')
                            }
                        }
                    })
                }
            }
        }
    }
}

