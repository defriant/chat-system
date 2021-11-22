const myId = $('#my-id').val()
let messageBodyActive = null
let userTyping = []
let usersConnectedId = []

globalChannel()
dmChannel()
typingChannel()
newRequestChannel()

function globalChannel() {
    Echo.join('user-connect')
        .here((users) => {
            $.each(users, function(i,v){
                usersConnectedId.push(v.id)
            })
            contact(usersConnectedId)
        })
        .joining((user) => {
            $('#dm-user-status-'+user.id).html(`<i class="fas fa-circle online"></i>Online</span>`)
            usersConnectedId.push(user.id)
        })
        .leaving((user) => {
            $('#dm-user-status-'+user.id).html(`<i class="fas fa-circle offline"></i>Offline</span>`)
            usersConnectedId.splice(usersConnectedId.indexOf(user.id), 1)
        })
    return;
}

function dmChannel() {
    Echo.channel('dm-'+myId)
        .listen('SendMessage', (data) => {
            let dmUnread = parseInt($('#dm-unread-'+data.from).html())
            if (messageBodyActive == data.from) {
                $('#last-message-'+data.from).html('Today')
                $.ajax({
                    type:'post',
                    url:'/messages/read/'+data.from
                })
            }else{
                $('#dm-unread-'+data.from).html(dmUnread + 1)
                $('#last-message-'+data.from).hide()
                $('#dm-unread-'+data.from).show()
            }
            let message = `<div class="messages-row">
                            <div class="messages">
                                <p class="message">`+data.message+`</p>
                                <div class="message-tool">
                                    <i class="fad fa-trash-alt"></i>
                                    <span>`+data.created+`</span>
                                </div>
                            </div>
                        </div>`
            userTyping.splice(userTyping.indexOf(data.from), 1)
            $('#user-typing-'+data.from).remove()
            $('#dm-user-status-'+data.from).html(`<i class="fas fa-circle online"></i>Online`)
            $('#conversation-'+data.from).append(message)
            let messageBodyHeight = $('#conversation-'+data.from).prop('scrollHeight')
            $('#conversation-'+data.from).scrollTop(messageBodyHeight)
            $('#direct-message-'+data.from).parent().prepend($('#direct-message-'+data.from))
            })
        .error((error) => {
            console.error(error)
        })
    return;
}

function typingChannel() {
    Echo.channel('user-typing-'+myId)
        .listen('UserTyping', (data) => {
            userTyping.push(data.typing)
            $('#dm-user-status-'+data.typing).html(`<div class="dm-user-status-typing" data-title=".dot-flashing">
                                                        <div class="stage">
                                                            <div class="dot-flashing"></div>
                                                        </div>
                                                    </div>`)
            let isTyping = `<div class="messages-row" id="user-typing-`+data.typing+`">
                                <div class="user-typing">
                                    <p>`+data.name+` is typing</p>
                                    <div class="typing-animation" data-title=".dot-flashing">
                                        <div class="stage">
                                            <div class="dot-flashing"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
            $('#user-typing-'+data.typing).remove()
            $('#conversation-'+data.typing).append(isTyping)
            let messageBodyHeight = $('#conversation-'+data.typing).prop('scrollHeight')
            $('#conversation-'+data.typing).scrollTop(messageBodyHeight)
            setTimeout(() => {
                let index = userTyping.indexOf(data.typing)
                userTyping.splice(index, 1)
                if (userTyping.indexOf(data.typing) == -1) {
                    $('#dm-user-status-'+data.typing).html(`<i class="fas fa-circle online"></i>Online`)
                    $('#user-typing-'+data.typing).remove()
                }
            }, 5000);
        })
    return;
}

function newRequestChannel() {
    Echo.channel('new-request-'+myId)
        .listen('NewRequest', (data) => {
            if (data.action == 'new_request') {
                $('#right-content-footer-'+data.from).html(`<div class="connect-request">
                                                            <div class="connect-request-message">
                                                                <p>This user is not in your connection.</p>
                                                                <p>Accept this user to allow connection and start conversation,</p>
                                                                <p>or Block to ignore conversation.</p>
                                                            </div>
                                                            <div class="connect-request-button">
                                                                <button class="accept-request request-action" data-userid="`+data.from+`" data-action="accept"><i class="fas fa-check"></i> Accept</button>
                                                                <button class="decline-request request-action" data-userid="`+data.from+`" data-action="block"><i class="fas fa-ban"></i> Block</button>
                                                            </div>
                                                        </div>`)
                newRequestAction()
            }else if (data.action == 'accept') {
                $('#no-connection-message-'+data.from).remove()
            }else if(data.action == 'block'){
                $('#no-connection-message-'+data.from).remove()
                $('#right-content-footer-'+data.from).html(`<div class="connect-request">
                                                            <div class="connect-request-message">
                                                                <p>This user has blocked your connection request</p>
                                                                <p>You can no longer send messages.</p>
                                                            </div>
                                                        </div>`)
            }else if(data.action == 'cancel_block'){
                $('#right-content-footer-'+data.from).html(`<div class="send-message-group">
                                                            <div class="message-group">
                                                                <i class="fad fa-comment-dots message-icon"></i>
                                                                <textarea rows="1" id="message" class="message-input" placeholder="Type your message..." data-typing="`+data.from+`"></textarea>
                                                            </div>
                                                            <button type="button" class="message-send" id="send-message" data-sendto="`+data.from+`"><i class="fad fa-paper-plane"></i></button>
                                                        </div>`)
                // Send message button
                sendMessageButton()
                // Typing
                messageInput()
            }
            contact(usersConnectedId)
        })
    return;
}

function contact(usersConnectedId) {
    $.ajax({
        type:'get',
        url:'/contact',
        success:function(data){
            $('.direct-messages').empty()
            $.each(data, function(i,v){
                let contactId = v.id
                let userStatus
                let userLastMessage
                let index = usersConnectedId.indexOf(contactId)
                let isActive = ''

                if (v.connection == 'request') {
                    userStatus = `<span class="dm-user-status request" id="dm-user-new-connection-`+v.id+`">Requested</span>`
                }else if(v.connection == 'new_request'){
                    userStatus = `<span class="dm-user-status request" id="dm-user-new-connection-`+v.id+`">New Request</span>`
                }else if(v.connection == 'blocked'){
                    userStatus = `<span class="dm-user-status request" id="dm-user-new-connection-`+v.id+`">Request Blocked</span>`
                }else if(v.connection == 'block'){
                    userStatus = `<span class="dm-user-status request" id="dm-user-new-connection-`+v.id+`">User Blocked</span>`
                }else if(v.connection == 'connected'){
                    if (index > -1) {
                        userStatus = `<span class="dm-user-status" id="dm-user-status-`+v.id+`"><i class="fas fa-circle online"></i>Online</span>`
                    }else{
                        userStatus = `<span class="dm-user-status" id="dm-user-status-`+v.id+`"><i class="fas fa-circle offline"></i>Offline</span>`
                    }
                }

                if (v.connection == 'connected') {
                    if (v.messageUnread > 0) {
                        userLastMessage = `<p class="last-message" id="last-message-`+v.id+`" style="display: none;">`+v.lastMessage+`</p>
                                            <span class="dm-unread" id="dm-unread-`+v.id+`">`+v.messageUnread+`</span>`
                    }else{
                        userLastMessage = `<p class="last-message" id="last-message-`+v.id+`">`+v.lastMessage+`</p>
                                            <span class="dm-unread" id="dm-unread-`+v.id+`" style="display: none;">0</span>`
                    }
                }else{
                    userLastMessage = `<p class="last-message" id="last-message-request-`+v.id+`" style="display: none;"></p>
                                            <span class="dm-unread" id="dm-unread-request-`+v.id+`" style="display: none;">0</span>`
                }

                if (v.id == messageBodyActive) {
                    isActive = 'active'
                }

                let Users = `<li class="direct-message `+isActive+`" id="direct-message-`+v.id+`" data-url="/me/dm/`+v.userId+`" data-userid="`+v.id+`" data-name="`+v.name+`" data-username="`+v.username+`" data-picture="`+v.picture+`">
                                    <img src="`+v.picture+`" class="dm-image">
                                    <div class="dm-info">
                                        <h4 class="dm-username">`+v.name+`</h4>
                                        <div class="dm-status">
                                            `+userStatus+`
                                        </div>
                                    </div>
                                    `+userLastMessage+`
                                </li>`
                $('.direct-messages').append(Users)
            })
            directMessage()
        }
    })
}

let searchInput = document.querySelector('.search-input')
let clearSearch = document.querySelector('.clear-search-icon')
searchInput.oninput = function(){
    if (this.value.length != 0) {
        clearSearch.classList.add('show')
    }else{
        clearSearch.classList.remove('show')
    }
}

clearSearch.onclick = function(){
    searchInput.value = ''
    this.classList.remove('show')
}

function directMessage() {
    // On Click DM
    $('.direct-message').on('click', function(){
        // Highlight selected DM
        $('.tools-link').removeClass('active')
        $('.direct-message').removeClass('active')
        $(this).addClass('active')
        $('.right-content').addClass('show')

        // Get user data
        let conversationUrl = $(this).data('url')
        let userid = $(this).data('userid')
        let name = $(this).data('name')
        let username = $(this).data('username')
        let picture = $(this).data('picture')

        // Set message body active
        messageBodyActive = userid

        // Update url
        history.pushState('', '', conversationUrl)
        
        // Insert conversation elements into right-content
        let conversationElements = `<div class="right-content-header">
                                        <i class="fas fa-times desktop-right-content-close" onclick="desktopRightContentClose()"></i>
                                        <i class="fas fa-chevron-left mobile-right-content-back" onclick="mobileRightContentClose()"></i>
                                        <img src="`+picture+`" alt="" class="header-img">
                                        <h4 class="header-name">`+name+`</h4>
                                    </div>
                                    <div class="right-content-body conversation-body" id="conversation-`+userid+`">

                                    </div>
                                    <div class="right-content-footer" id="right-content-footer-`+userid+`">
                                        
                                    </div>`
        $('#right-content').empty()
        $('#right-content').html(conversationElements)

        // Get conversation from this user
        getConversation(userid, name)

        // Read message
        readMessage(userid)

    })
}

const month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

let lastMessageDate = null

function getConversation(userid, name) {
    $.ajax({
        type:'post',
        url:'/me/dm/get-conversation/'+userid,
        success:function(data){
            let messageCurrentPage = data.currentPage
            let messageNextPage
            let messageHasMorePage = data.hasMorePage

            $('#conversation-'+userid).append(`<div id="message-page-`+messageCurrentPage+`"></div>`)

            if (messageHasMorePage) {
                messageNextPage = data.nextPageUrl.split('page=')[1]
                getConversationNextPage(userid, messageNextPage)
            }else{
                $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(`<div class="messages-row">
                                                                                        <div class="messages-start">
                                                                                            <p>This is the beginning of the conversation.</p>
                                                                                            <p>All messages are encrypted <i class="fas fa-lock"></i></p>
                                                                                        </div>
                                                                                    </div>`)
            }

            if (data.connection === "notConnected" || data.connection === "request") {
                $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(`<div class="messages-row" id="no-connection-message-`+userid+`">
                                                        <div class="messages-start">
                                                            <p>You have no connection to this user.</p>
                                                            <p>Say something to request a connection, and start the conversation</p>
                                                        </div>
                                                    </div>`)
                $('#right-content-footer-'+userid).html(`<div class="send-message-group">
                                                            <div class="message-group">
                                                                <i class="fad fa-comment-dots message-icon"></i>
                                                                <textarea rows="1" id="message" class="message-input" placeholder="Type your message..." data-typing="`+userid+`"></textarea>
                                                            </div>
                                                            <button type="button" class="message-send" id="send-message" data-sendto="`+userid+`"><i class="fad fa-paper-plane"></i></button>
                                                        </div>`)
                sendMessageButton()
                messageInput()
            }else if(data.connection === "new_request"){
                $('#right-content-footer-'+userid).html(`<div class="connect-request">
                                                            <div class="connect-request-message">
                                                                <p>This user is not in your connection.</p>
                                                                <p>Accept this user to allow connection and start conversation,</p>
                                                                <p>or Block to ignore conversation.</p>
                                                            </div>
                                                            <div class="connect-request-button">
                                                                <button class="accept-request request-action" data-userid="`+userid+`" data-action="accept"><i class="fas fa-check"></i> Accept</button>
                                                                <button class="decline-request request-action" data-userid="`+userid+`" data-action="block"><i class="fas fa-ban"></i> Block</button>
                                                            </div>
                                                        </div>`)
                newRequestAction()
            }else if(data.connection === 'blocked'){
                $('#right-content-footer-'+userid).html(`<div class="connect-request">
                                                            <div class="connect-request-message">
                                                                <p>This user has blocked your connection request</p>
                                                                <p>You can no longer send messages.</p>
                                                            </div>
                                                        </div>`)
            }else if(data.connection === 'block'){
                $('#right-content-footer-'+userid).html(`<div class="connect-request">
                                                                <div class="connect-request-message">
                                                                    <p>You've blocked this this user connection.</p>
                                                                    <p>This user can no longer send you a messages.</p>
                                                                </div>
                                                                <div class="connect-request-button">
                                                                    <button class="decline-request request-action" data-userid="`+userid+`" data-action="cancel_block"><i class="fas fa-undo"></i> Cancel Block</button>
                                                                </div>
                                                            </div>`)
                    newRequestAction()
            }else if(data.connection === "connected"){
                $('#right-content-footer-'+userid).html(`<div class="send-message-group">
                                                            <div class="message-group">
                                                                <i class="fad fa-comment-dots message-icon"></i>
                                                                <textarea rows="1" id="message" class="message-input" placeholder="Type your message..." data-typing="`+userid+`"></textarea>
                                                            </div>
                                                            <button type="button" class="message-send" id="send-message" data-sendto="`+userid+`"><i class="fad fa-paper-plane"></i></button>
                                                        </div>`)
                sendMessageButton()
                messageInput()
            }

            let newToday = new Date()
            let today = newToday.getDate()+' '+month[newToday.getMonth()]+' '+newToday.getFullYear()
            lastMessageDate = null

            $.each(data.messages, function(i,v){
                let newCDate = new Date(v.date) 
                let cDateFirst = newCDate.getDate()+' '+month[newCDate.getMonth()]+' '+newCDate.getFullYear()
                let cDate

                if (cDateFirst == today) {
                    cDate = 'Today'
                }else{
                    cDate = cDateFirst
                }

                if (cDateFirst != lastMessageDate) {
                    $('#messages-date-'+v.date).remove()
                    $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(`<div class="messages-row" id="messages-date-`+v.date+`">
                                                            <div class="messages-date">
                                                                <hr class="hr-light">
                                                                <span>`+cDate+`</span>
                                                                <hr class="hr-light">
                                                            </div>
                                                        </div>`)
                    lastMessageDate = cDateFirst
                }

                if (v.from == myId) {
                    let message = `<div class="messages-row">
                                        <div class="messages me">
                                            <p class="message">`+v.message+`</p>
                                            <div class="message-tool">
                                                <i class="fad fa-trash-alt"></i>
                                                <span>`+v.time+`</span>
                                            </div>
                                        </div>
                                    </div>`
                    $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(message)
                }else{
                    let message = `<div class="messages-row">
                                        <div class="messages">
                                            <p class="message">`+v.message+`</p>
                                            <div class="message-tool">
                                                <i class="fad fa-trash-alt"></i>
                                                <span>`+v.time+`</span>
                                            </div>
                                        </div>
                                    </div>`
                    $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(message)
                }
            })

            if (userTyping.indexOf(userid) > -1) {
                let isTyping = `<div class="messages-row" id="user-typing-`+userid+`">
                                <div class="user-typing">
                                    <p>`+name+` is typing</p>
                                    <div class="typing-animation" data-title=".dot-flashing">
                                        <div class="stage">
                                            <div class="dot-flashing"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(isTyping)
            }

            let messageBodyHeight = $('.conversation-body').prop('scrollHeight')
            $('.conversation-body').scrollTop(messageBodyHeight)
        }
    });
}

function getConversationNextPage(userid, messageNextPage) {
    let nextPageLoad = null
    let lastMessageDateNext = null
    $('.conversation-body').on('scroll', function(){
        let messageBodyScroll = $('.conversation-body').scrollTop()
        if (messageBodyScroll < 100) {
            if (nextPageLoad != 'loaded') {
                nextPageLoad = 'loaded'
                $('#conversation-'+userid).prepend(`<div id="message-page-`+messageNextPage+`"></div>`)
                $('#message-page-'+messageNextPage).html(`<div class="messages-row">
                                                            <div class="next-message-loading" id="connect-request-loading"></div>
                                                        </div>`)
                $.ajax({
                    type:'post',
                    url:'/me/dm/get-conversation/'+userid+'?page='+messageNextPage,
                    success:function(data){
                        let messageNextPage
                        let messageHasMorePage = data.hasMorePage
                        let messageCurrentPage = data.currentPage

                        let oldScroll = $('.conversation-body').scrollTop()
                        let oldHeight = $('.conversation-body')[0].scrollHeight
                        $('#message-page-'+messageCurrentPage).empty()
                        
                        if (messageHasMorePage) {
                            messageNextPage = data.nextPageUrl.split('page=')[1]
                            getConversationNextPage(userid, messageNextPage)
                        }else{
                            $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(`<div class="messages-row">
                                                                                                        <div class="messages-start">
                                                                                                            <p>This is the beginning of the conversation.</p>
                                                                                                            <p>All messages are encrypted <i class="fas fa-lock"></i></p>
                                                                                                        </div>
                                                                                                    </div>`)
                        }

                        let newToday = new Date()
                        let today = newToday.getDate()+' '+month[newToday.getMonth()]+' '+newToday.getFullYear()
                        lastMessageDateNext = null

                        $.each(data.messages, function(i,v){
                            let newCDate = new Date(v.date)
                            let cDateFirst = newCDate.getDate()+' '+month[newCDate.getMonth()]+' '+newCDate.getFullYear()
                            let cDate

                            if (cDateFirst == today) {
                                cDate = 'Today'
                            }else{
                                cDate = cDateFirst
                            }

                            if (cDateFirst != lastMessageDateNext) {
                                $('#messages-date-'+v.date).remove()
                                $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(`<div class="messages-row" id="messages-date-`+v.date+`">
                                                                        <div class="messages-date">
                                                                            <hr class="hr-light">
                                                                            <span>`+cDate+`</span>
                                                                            <hr class="hr-light">
                                                                        </div>
                                                                    </div>`)
                                lastMessageDateNext = cDateFirst
                            }

                            if (v.from == myId) {
                                let message = `<div class="messages-row">
                                                    <div class="messages me">
                                                        <p class="message">`+v.message+`</p>
                                                        <div class="message-tool">
                                                            <i class="fad fa-trash-alt"></i>
                                                            <span>`+v.time+`</span>
                                                        </div>
                                                    </div>
                                                </div>`
                                $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(message)
                            }else{
                                let message = `<div class="messages-row">
                                                    <div class="messages">
                                                        <p class="message">`+v.message+`</p>
                                                        <div class="message-tool">
                                                            <i class="fad fa-trash-alt"></i>
                                                            <span>`+v.time+`</span>
                                                        </div>
                                                    </div>
                                                </div>`
                                $('#conversation-'+userid+' #message-page-'+messageCurrentPage).append(message)
                            }
                        })
                        
                        $('.conversation-body').scrollTop(oldScroll + $('.conversation-body')[0].scrollHeight - oldHeight)
                    }
                })
            }
        }
    })
}

function readMessage(userid) {
    $.ajax({
        type:'post',
        url:'/messages/read/'+userid,
        success:function(lastMessage){
            // Remove unread message badge
            $('#last-message-'+userid).html(lastMessage)
            $('#dm-unread-'+userid).hide()
            $('#last-message-'+userid).show()
            $('#dm-unread-'+userid).html('0')
        }
    })
    
}

function sendMessageButton() {
    $('#send-message').on('click', function(){
        let message = $('#message').val()
        let messageLength = message.replace(/ /g, "")
        if(messageLength.length != 0){
            sendMessage(message)
        }
    })
}

let typing = null
function messageInput() {
    let mediaSize = window.matchMedia("(min-width: 992px)")
    if(mediaSize.matches){
        $('#message').on('keypress', function(e){
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault()
                let message = $('#message').val()
                let messageLength = message.replace(/ /g, "")
                if(messageLength.length != 0){
                    sendMessage(message)
                    $(this).val('')
                }
            }
        })
    }

    $('#message').on('input', function(){
        let message = $(this).val()
        let typingTo = $(this).data('typing')
        
        if (message.length > 0) {
            if (typing == typingTo) {
                
            }else{
                typing = typingTo
                setTimeout(() => {
                    typing = null
                }, 4000);
                $.ajax({
                    type:'post',
                    url:'/me/typing',
                    data:{
                        typingTo:typingTo
                    }
                })
            }
        }
    })
}

function sendMessage(message) {
    let sendTo = $('#send-message').data('sendto')
    let date = new Date()
    let today = date.getDate()+' '+month[date.getMonth()]+' '+date.getFullYear()
    if (lastMessageDate != today) {
        $('#conversation-'+sendTo).append(`<div class="messages-row">
                                                <div class="messages-date">
                                                    <hr class="hr-light">
                                                    <span>Today</span>
                                                    <hr class="hr-light">
                                                </div>
                                            </div>`)
        lastMessageDate = today
    }
    
    let messageCreated = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    let messageId = date.getTime()
    let myMessage = `<div class="messages-row">
                        <div class="messages me sending" id="message-`+messageId+`">
                            <p class="message">`+message+`</p>
                            <div class="message-tool">
                                <i class="fad fa-trash-alt"></i>
                                <span></span>
                            </div>
                        </div>
                    </div>`
    $('#conversation-'+sendTo).append(myMessage)
    let messageBodyHeight = $('.conversation-body').prop('scrollHeight')
    $('.conversation-body').scrollTop(messageBodyHeight)
    $('#message').val('')
    $.ajax({
        type:'post',
        url:'/send-message',
        data:{
            id:sendTo,
            message:message,
            created:messageCreated
        },
        success:function(data){
            if (data.connection === 'notConnected') {
                contact(usersConnectedId)
            }
            $('#message-'+messageId+' .message-tool span').html(data.created)
            $('#message-'+messageId).removeClass('sending')
            let messageBodyHeight = $('.conversation-body').prop('scrollHeight')
            $('.conversation-body').scrollTop(messageBodyHeight)
            $('#last-message-'+sendTo).html(data.lastMessage)
            $('#direct-message-'+sendTo).parent().prepend($('#direct-message-'+sendTo))
        }
    })
}

function desktopRightContentClose() {
    $('#right-content').empty()
    $('#right-content').html(`<div></div>
                            <div class="right-content-landed">
                                <img src="/assets/img/stay-connected.png" alt="">
                                <h4>KEEP YOUR SECRET AND STAY CONNECTED.</h4>
                                <h4>YOUR MESSAGES ARE FULLY ENCRYPTED <i class="fas fa-lock"></i></h4>
                            </div>
                            <div></div>`)
    $('.right-content').removeClass('show')
    $('.direct-message').removeClass('active')
    $('.tools-link').removeClass('active')
    messageBodyActive = null
    history.pushState('', '', '/me')
}

function mobileRightContentClose() {
    $('.right-content').removeClass('show')
    $('.direct-message').removeClass('active')
    messageBodyActive = null
    history.pushState('', '', '/me')
}

function desktopNewConversationClose() {
    $('#right-content').empty()
    $('#right-content').html(`<div></div>
                            <div class="right-content-landed">
                                <img src="/assets/img/stay-connected.png" alt="">
                                <h4>KEEP YOUR SECRET AND STAY CONNECTED.</h4>
                                <h4>YOUR MESSAGES ARE FULLY ENCRYPTED <i class="fas fa-lock"></i></h4>
                            </div>
                            <div></div>`)
    $('.right-content').removeClass('show')
    $('.direct-message').removeClass('active')
    $('.tools-link').removeClass('active')
}

function mobileNewConversationClose() {
    $('.right-content').removeClass('show')
    $('.direct-message').removeClass('active')
}

function userSetting(e) {
    e.preventDefault()
    messageBodyActive = null
    $('#right-content').empty()
    $('.right-content').addClass('show')
    $('.direct-message').removeClass('active')
    $('.tools-link').removeClass('active')
    $('#user-setting-link').addClass('active')
    $.ajax({
        type:'post',
        url:'/me/settings',
        cache:false,
        success:function(data){
            $('#right-content').html(data)
            history.pushState('', '', '/me/settings')
        }
    })
}

function userLogout() {
    window.location = '/logout'
}

function newConversation(e) {
    e.preventDefault()
    if (window.location.pathname != '/me') {
        history.pushState('', '', '/me')
    }
    messageBodyActive = null
    $('#right-content').empty()
    $('.right-content').addClass('show')
    $('.direct-message').removeClass('active')
    $('.tools-link').removeClass('active')
    $('#new-conversation').addClass('active')
    let newConversationContent = `<div>
                                    <button class="desktop-settings-right-content-close" onclick="desktopNewConversationClose()"><i class="fas fa-times"></i></button>
                                    <button class="mobile-settings-right-content-back" onclick="mobileNewConversationClose()"><i class="fas fa-chevron-left"></i></button>
                                </div>
                                <div class="new-conversation-body">
                                    <h5 class="new-conversation-title">Find users by username to start a conversation.</h5>
                                    <div class="search-group">
                                        <i class="far fa-user search-icon"></i>
                                        <input type="text" class="search-input" id="search-user-input" placeholder="@username...">
                                        <button class="search-user" id="btn-search-user"><i class="fas fa-search"></i></button>
                                        <div class="search-user-loading"></div>
                                    </div>
                                    <div class="search-user-result" id="search-user-result">
                                    </div>
                                </div>`
    $('#right-content').empty()
    $('#right-content').html(newConversationContent)
    searchUser()
}

function searchUser() {
    $('#btn-search-user').on('click', function(){
        $('#search-user-result').empty()
        $('#btn-search-user').hide()
        $('.search-user-loading').show()
        $.ajax({
            type:'post',
            url:'/me/search-user',
            data:{
                username:$('#search-user-input').val()
            },
            success:function(data){
                if (data == 'userNotFound') {
                    $('#search-user-result').html(`<h4 class="search-user-not-found"><i>User not found <br> make sure you use "@" and it's cAsE SeNsItIvE !</i></h4>`)
                }else{
                    $('#search-user-result').html(`<img src="`+data.picture+`">
                                                    <h4>`+data.name+`</h4>
                                                    <span>`+data.username+`</span>
                                                    <br>
                                                    <button class="btn-chat" id="new-dm" data-url="/me/dm/`+data.userId+`" data-userid="`+data.id+`" data-name="`+data.name+`" data-username="`+data.username+`" data-picture="`+data.picture+`"><i class="fas fa-comment-dots"></i>Direct Message</button>`)
                }
                $('.search-user-loading').hide()
                $('#btn-search-user').show()
                newDm()
            }
        })
    })
}

function newDm() {
    $('#new-dm').on('click', function(){
        $('.tools-link').removeClass('active')
        $('.direct-message').removeClass('active')

        let conversationUrl = $(this).data('url')
        let userid = $(this).data('userid')
        let name = $(this).data('name')
        let username = $(this).data('username')
        let picture = $(this).data('picture')

        messageBodyActive = userid
        history.pushState('', '', conversationUrl)
        
        let conversationElements = `<div class="right-content-header">
                                        <i class="fas fa-times desktop-right-content-close" onclick="desktopRightContentClose()"></i>
                                        <i class="fas fa-chevron-left mobile-right-content-back" onclick="mobileRightContentClose()"></i>
                                        <img src="`+picture+`" alt="" class="header-img">
                                        <h4 class="header-name">`+name+`</h4>
                                    </div>
                                    <div class="right-content-body conversation-body" id="conversation-`+userid+`">

                                    </div>
                                    <div class="right-content-footer" id="right-content-footer-`+userid+`">
                                        
                                    </div>`
        $('#right-content').empty()
        $('#right-content').html(conversationElements)

        // Get conversation from this user
        getConversation(userid, name)

        // Read message
        readMessage(userid)
    })
}

function newRequestAction() {
    $('.request-action').on('click', function(){
        let userid = $(this).data('userid')
        let action = $(this).data('action')
        $('#right-content-footer-'+userid).html(`<div class="connect-request">
                                                    <div class="connect-request-loading" id="connect-request-loading"></div>
                                                </div>`)
        $.ajax({
            type:'post',
            url:'/me/new-request-action',
            data:{
                userid:userid,
                action:action
            },
            success:function(response){
                if (response == 'accept') {
                    $('#right-content-footer-'+userid).html(`<div class="send-message-group">
                                                                <div class="message-group">
                                                                    <i class="fad fa-comment-dots message-icon"></i>
                                                                    <textarea rows="1" id="message" class="message-input" placeholder="Type your message..." data-typing="`+userid+`"></textarea>
                                                                </div>
                                                                <button type="button" class="message-send" id="send-message" data-sendto="`+userid+`"><i class="fad fa-paper-plane"></i></button>
                                                            </div>`)
                    // Send message button
                    sendMessageButton()
                    // Typing
                    messageInput()
                }else if(response == 'block'){
                    $('#right-content-footer-'+userid).html(`<div class="connect-request">
                                                                <div class="connect-request-message">
                                                                    <p>You've blocked this user connection.</p>
                                                                    <p>This user can no longer send you a messages.</p>
                                                                </div>
                                                                <div class="connect-request-button">
                                                                    <button class="decline-request request-action" data-userid="`+userid+`" data-action="cancel_block"><i class="fas fa-undo"></i> Cancel Block</button>
                                                                </div>
                                                            </div>`)
                    newRequestAction()
                }else if(response == 'cancel_block'){
                    $('#right-content-footer-'+userid).html(`<div class="send-message-group">
                                                                <div class="message-group">
                                                                    <i class="fad fa-comment-dots message-icon"></i>
                                                                    <textarea rows="1" id="message" class="message-input" placeholder="Type your message..." data-typing="`+userid+`"></textarea>
                                                                </div>
                                                                <button type="button" class="message-send" id="send-message" data-sendto="`+userid+`"><i class="fad fa-paper-plane"></i></button>
                                                            </div>`)
                    // Send message button
                    sendMessageButton()
                    // Typing
                    messageInput()
                }
                contact(usersConnectedId)
            }
        })
    })
}




