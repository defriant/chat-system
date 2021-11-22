<div class="left-top-content">
    <div class="account">
        <div class="account-img">
            @if (Auth::user()->picture != null)
                <img src="{{ asset('assets/user_picture/'.Auth::user()->picture) }}">
            @else
                <img src="{{ asset('assets/user_picture/no-picture.png') }}">
            @endif
        </div>
        <div class="account-info">
            <input type="hidden" id="my-id" value="{{ Auth::user()->id }}">
            <h4 class="name">{{ Auth::user()->name }}</h4>
            <p class="id">{{ Auth::user()->username }}</p>
        </div>
        <div class="mobile-tools">
            <a class="mobile-tools-link" onclick="newConversation(event)">
                <i class="fad fa-comment-alt-dots mobile-tools-link-icon"></i>
            </a>
            <a class="mobile-tools-link" onclick="userSetting(event)">
                <i class="fad fa-cog mobile-tools-link-icon"></i>
            </a>
        </div>
    </div>
    <ul class="tools">
        <li>
            <a class="tools-link {{ Request::is('me/settings') ? 'active' : '' }}" id="user-setting-link" onclick="userSetting(event)"><i class="fad fa-cog tools-link-icon"></i>Settings</a>
        </li>
        <li>
            <a class="tools-link" id="new-conversation" onclick="newConversation(event)"><i class="fad fa-comment-alt-dots tools-link-icon"></i>New Conversation</a>
        </li>
        <li>
            <hr>
        </li>
    </ul>
    <div class="search-group">
        <i class="fad fa-search search-icon"></i>
        <input type="text" class="search-input" name="" placeholder="Search DM...">
        <i class="fas fa-times clear-search-icon"></i>
    </div>
    <h4 class="dm-title">DIRECT MESSAGES</h4>
</div>
<div class="left-bottom-content">
    <ul class="direct-messages">
    </ul>
</div>