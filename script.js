// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let deletedPostsArchive = []; // Хогийн сав
let currentTab = 'feed';
let selectedFriend = null;

// Орчуулгын сан (Timeline - Ирээдүйн урсгал)
const translations = {
    en: {
        feed: "Timeline",
        friends: "🤝 Friends & Chats",
        chats: "🤖 Future Bot",
        profileSettings: "⚙️ Profile Settings",
        futurePlaceholder: "What will happen in the future? Share here...",
        postBtn: "Post",
        verifiedFuture: "Ирээдүй биелсэн",
        writeComment: "Write a comment...",
        botTitle: "Future Bot 🤖",
        sendBtn: "Send",
        bannedWordAlert: "Your post contains banned keywords!",
        searchLabel: "Search Timeline..."
    },
    mn: {
        feed: "Ирээдүйн урсгал",
        friends: "🤝 Найзууд & Чат",
        chats: "🤖 Ирээдүйн Бот",
        profileSettings: "⚙️ Профайл Тохиргоо",
        futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...",
        postBtn: "Нийтлэх",
        verifiedFuture: "Ирээдүй биелсэн",
        writeComment: "Сэтгэгдэл бичих...",
        botTitle: "Ирээдүйн Бот 🤖",
        sendBtn: "Илгээх",
        bannedWordAlert: "Таны постонд хориотой үг байна!",
        searchLabel: "Search Timeline..."
    }
};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

// Апп ачаалагдах үед ажиллах үндсэн код
document.addEventListener('DOMContentLoaded', () => {
    document.body.className = "theme-" + currentTheme;
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.innerText = "🎨 Theme: " + currentTheme.toUpperCase();

    const savedUser = localStorage.getItem('iknow_current_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showMainApp();
        } catch (e) {
            showAuthPage('login');
        }
    } else {
        showAuthPage('login');
    }
    applyTranslations();
});

function toggleTheme() {
    if (currentTheme === 'cyber') currentTheme = 'matrix';
    else if (currentTheme === 'matrix') currentTheme = 'dark';
    else currentTheme = 'cyber';

    localStorage.setItem('iknow_theme', currentTheme);
    document.body.className = "theme-" + currentTheme;
    
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.innerText = "🎨 Theme: " + currentTheme.toUpperCase();
}
function switchLang() {
    currentLang = currentLang === 'mn' ? 'en' : 'mn';
    localStorage.setItem('iknow_lang', currentLang);
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) langBtn.innerText = currentLang === 'mn' ? 'English' : 'Монгол';
    applyTranslations();
    if (allPosts.length > 0) renderPosts();
}

function applyTranslations() {
    const langData = translations[currentLang];
    if (!langData) return;

    const ids = [
        'feed-btn', 'friends-btn', 'chats-btn', 'profile-btn', 
        'post-btn', 'bot-title', 'send-btn'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let key = id.replace('-btn', '').replace('-title', '');
            if (id === 'feed-btn') key = 'feed';
            if (id === 'friends-btn') key = 'friends';
            if (id === 'chats-btn') key = 'chats';
            if (id === 'profile-btn') key = 'profileSettings';
            if (id === 'post-btn') key = 'postBtn';
            if (id === 'send-btn') key = 'sendBtn';
            
            if (langData[key]) el.innerText = langData[key];
        }
    });

    const futureInput = document.getElementById('future-input');
    if (futureInput && langData.futurePlaceholder) futureInput.placeholder = langData.futurePlaceholder;

    const botInput = document.getElementById('bot-input');
    if (botInput && langData.botPlaceholder) botInput.placeholder = langData.botPlaceholder;

    const searchInput = document.getElementById('search-input');
    if (searchInput && langData.searchLabel) searchInput.placeholder = langData.searchLabel;
}

function showAuthPage(page) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const authContainer = document.getElementById('auth-container');
    const mainApp = document.getElementById('main-app');

    if (mainApp) mainApp.style.display = 'none';
    if (authContainer) authContainer.style.display = 'flex';

    if (page === 'login') {
        if (loginCard) loginCard.style.display = 'block';
        if (registerCard) registerCard.style.display = 'none';
    } else {
        if (loginCard) loginCard.style.display = 'none';
        if (registerCard) registerCard.style.display = 'block';
    }
}

function handleRegister(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('reg-username')?.value.trim();
    const passwordInput = document.getElementById('reg-password')?.value;

    if (!usernameInput || !passwordInput) {
        alert("Please fill all fields!");
        return;
    }

    let usersDb = [];
    try {
        usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || [];
    } catch (err) { usersDb = []; }

    const userExists = usersDb.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());
    if (userExists) {
        alert("Username already taken!");
        return;
    }

    const newUser = {
        username: usernameInput,
        password: passwordInput,
        avatar: "https://robohash.org" + encodeURIComponent(usernameInput) + ".png?set=set4"
    };
    
    usersDb.push(newUser);
    localStorage.setItem('iknow_users_db', JSON.stringify(usersDb));
    alert("Registration successful!");
    showAuthPage('login');
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('login-username')?.value.trim();
    const passwordInput = document.getElementById('login-password')?.value;

    if (!usernameInput || !passwordInput) {
        alert("Please fill all fields!");
        return;
    }

    let usersDb = [];
    try {
        usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || [];
    } catch (err) { usersDb = []; }

    const matchedUser = usersDb.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);

    if (matchedUser) {
        currentUser = matchedUser;
        localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert("Wrong credentials!");
    }
}

function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const nameInput = document.getElementById('modal-username');
    const avatarInput = document.getElementById('modal-avatar');

    if (modal && currentUser) {
        if (nameInput) nameInput.value = currentUser.username;
        if (avatarInput) avatarInput.value = currentUser.avatar || '';
        modal.style.display = 'flex';
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

function handleAvatarFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarInput = document.getElementById('modal-avatar');
        if (avatarInput) avatarInput.value = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveProfileModal() {
    const newName = document.getElementById('modal-username')?.value.trim();
    const newAvatar = document.getElementById('modal-avatar')?.value.trim();

    if (!newName) {
        alert("Username cannot be empty!");
        return;
    }

    let usersDb = [];
    try { usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || []; } catch (err) { usersDb = []; }

    usersDb = usersDb.map(u => {
        if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
            u.username = newName;
            if (newAvatar) u.avatar = newAvatar;
        }
        return u;
    });
    localStorage.setItem('iknow_users_db', JSON.stringify(usersDb));

    currentUser.username = newName;
    if (newAvatar) currentUser.avatar = newAvatar;
    localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));

    closeProfileModal();
    showMainApp();
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.menu-tab').forEach(el => el.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.style.display = 'block';

    const activeBtn = document.getElementById(`${tabName === 'feed' ? 'feed' : tabName === 'friends' ? 'friends' : 'chats'}-btn`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'friends') loadFriendsList();
}

function showMainApp() {
    const authContainer = document.getElementById('auth-container');
    const mainApp = document.getElementById('main-app');

    if (authContainer) authContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';

    const profileName = document.getElementById('profile-name');
    if (profileName && currentUser) profileName.innerText = currentUser.username;

    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar && currentUser.avatar) profileAvatar.src = currentUser.avatar;

    loadPosts();
}

function toggleLanguage() { switchLang(); }
// 🖼️ ЗУРАГ/ВИДЕОГ ШУУД ДЭЛГЭЦЭНД УРЬДЧИЛЖ ХАРУУЛАХ (PREVIEW) ФУНКЦ
let postAttachedMedia = null;
function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        postAttachedMedia = { type: type, url: e.target.result };
        
        const previewBox = document.getElementById('post-media-preview-box');
        const previewImg = document.getElementById('post-image-preview-img');
        const previewVid = document.getElementById('post-video-preview-vid');

        if (previewBox) previewBox.style.display = 'block';
        
        if (type === 'image' && previewImg && previewVid) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewVid.style.display = 'none';
        } else if (type === 'video' && previewVid && previewImg) {
            previewVid.src = e.target.result;
            previewVid.style.display = 'block';
            previewImg.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function clearAttachedMedia() {
    postAttachedMedia = null;
    const previewBox = document.getElementById('post-media-preview-box');
    const previewImg = document.getElementById('post-image-preview-img');
    const previewVid = document.getElementById('post-video-preview-vid');

    if (previewBox) previewBox.style.display = 'none';
    if (previewImg) previewImg.style.display = 'none';
    if (previewVid) previewVid.style.display = 'none';
}

function loadPosts() {
    try {
        allPosts = JSON.parse(localStorage.getItem('iknow_posts_db')) || [];
        deletedPostsArchive = JSON.parse(localStorage.getItem('iknow_archive_db')) || [];
    } catch (e) { 
        allPosts = []; 
        deletedPostsArchive = [];
    }
    renderPosts();
}

// 🕒 FACEBOOK ШИГ ХУГАЦАА БОДДОГ ФУНКЦ
function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
         return currentLang === 'mn' ? 'Яг одоо' : 'Just now';   
    } else if (elapsed < msPerHour) {
         const mins = Math.round(elapsed/msPerMinute);
         return currentLang === 'mn' ? `${mins} минутын өмнө` : `${mins} min ago`;   
    } else if (elapsed < msPerDay) {
         const hours = Math.round(elapsed/msPerHour);
         return currentLang === 'mn' ? `${hours} цагийн өмнө` : `${hours} hours ago`;   
    } else {
        const days = Math.round(elapsed/msPerDay);
        return currentLang === 'mn' ? `${days} өдрийн өмнө` : `${days} days ago`;   
    }
}

function createPost() {
    const inputEl = document.getElementById('future-input');
    const text = inputEl ? inputEl.value.trim() : "";

    if (!text && !postAttachedMedia) return;

    const hasBannedWord = bannedKeywords.some(word => text.toLowerCase().includes(word));
    if (hasBannedWord) {
        alert(translations[currentLang].bannedWordAlert || "Your post contains banned keywords!");
        return;
    }

    const newPost = {
        id: 'post_' + Date.now(),
        author: currentUser ? currentUser.username : "Anonymous",
        text: text,
        media: postAttachedMedia,
        timestamp: new Date().toISOString(),
        votes: 0,
        reports: [],
        comments: []
    };

    allPosts.unshift(newPost);
    localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));

    if (inputEl) inputEl.value = "";
    clearAttachedMedia();

    renderPosts();
}

function deletePost(postId) {
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    if (!confirm(currentLang === 'mn' ? "Энэ постыг устгах уу? (Та хожим сэргээж болно)" : "Move this post to archive?")) return;
    
    const targetPost = allPosts[postIndex];
    deletedPostsArchive.push(targetPost);
    allPosts.splice(postIndex, 1);

    localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
    localStorage.setItem('iknow_archive_db', JSON.stringify(deletedPostsArchive));
    renderPosts();
}

function restorePost(postId) {
    const archiveIndex = deletedPostsArchive.findIndex(p => p.id === postId);
    if (archiveIndex === -1) return;

    const restoredPost = deletedPostsArchive[archiveIndex];
    allPosts.unshift(restoredPost);
    deletedPostsArchive.splice(archiveIndex, 1);

    localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
    localStorage.setItem('iknow_archive_db', JSON.stringify(deletedPostsArchive));
    alert(currentLang === 'mn' ? "Пост амжилттай сэргээгдлээ!" : "Post restored successfully!");
    renderPosts();
}
function reportPost(postId) {
    if (!currentUser) return;
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    if (!post.reports) post.reports = [];

    if (post.reports.includes(currentUser.username)) {
        alert(currentLang === 'mn' ? "Та аль хэдийн гомдол гаргасан байна!" : "You have already reported this post!");
        return;
    }

    if (confirm(currentLang === 'mn' ? "Энэ постонд гомдол гаргах уу?" : "Report this post?")) {
        post.reports.push(currentUser.username);

        if (post.reports.length >= 10) {
            alert(currentLang === 'mn' ? "Энэ постыг 10 иргэн гомдоллосон тул систем автоматаар устгалаа." : "Post auto-deleted due to 10 reports.");
            allPosts = allPosts.filter(p => p.id !== postId);
        }

        localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
        renderPosts();
    }
}

function searchPosts() {
    renderPosts();
}

function renderPosts() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = "";
    const searchVal = document.getElementById('search-input')?.value.toLowerCase() || "";

    let filteredPosts = allPosts.filter(post => 
        post.text.toLowerCase().includes(searchVal) || 
        post.author.toLowerCase().includes(searchVal)
    );

    filteredPosts.sort((a, b) => b.votes - a.votes);

    let usersDb = [];
    try { usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || []; } catch(e){}

    filteredPosts.forEach(post => {
        const postEl = document.createElement('div');
        
        let tierClass = "post-card";
        if (post.votes >= 5000) tierClass += " tier-matrix";
        else if (post.votes >= 500) tierClass += " tier-electric";
        else if (post.votes >= 50) tierClass += " tier-fire";
        postEl.className = tierClass;

        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') mediaHtml = `<div class="post-media-content"><img src="${post.media.url}"></div>`;
            else if (post.media.type === 'video') mediaHtml = `<div class="post-media-content"><video src="${post.media.url}" controls></video></div>`;
        }

        let commentsHtml = "";
        post.comments.forEach(c => {
            const cUser = usersDb.find(u => u.username.toLowerCase() === c.author.toLowerCase());
            const cAvatar = cUser ? cUser.avatar : "https://robohash.org";
            const cTime = c.timestamp ? timeAgo(c.timestamp) : "";

            commentsHtml += `
                <div class="comment-node" style="display:flex; align-items:center; gap:8px;">
                    <img src="${cAvatar}" style="width:20px; height:20px; border-radius:50%;">
                    <div style="flex:1;">
                        <strong>${c.author}:</strong> ${c.text}
                        <span style="font-size:10px; color:var(--text-gray); margin-left:5px;">${cTime}</span>
                    </div>
                </div>`;
        });

        const authorUser = usersDb.find(u => u.username.toLowerCase() === post.author.toLowerCase());
        const liveAvatar = authorUser ? authorUser.avatar : "https://robohash.org";

        let deleteBtnHtml = "";
        if (currentUser && (post.author === currentUser.username || currentUser.username.toLowerCase() === 'sainaa34')) {
            deleteBtnHtml = `<button onclick="deletePost('${post.id}')" style="background:none; border:none; color:var(--cyber-magenta); cursor:pointer; font-size:12px; margin-left:10px;">🗑️</button>`;
        }

        const reportCount = post.reports ? post.reports.length : 0;

        postEl.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="${liveAvatar}" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author} ${deleteBtnHtml}</h4>
                        <span>📅 ${timeAgo(post.timestamp)}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <button onclick="reportPost('${post.id}')" class="report-btn-cyber">⚠️ Report (${reportCount}/10)</button>
                    <div class="vote-tooltip-container">
                        <button onclick="votePost('${post.id}')" class="vote-btn-neon">🔮 (${post.votes})</button>
                        <span class="tooltip-box-text">${translations[currentLang].verifiedFuture || "Ирээдүй биелсэн"}</span>
                    </div>
                </div>
            </div>
            <p class="post-main-text">${post.text}</p>
            ${mediaHtml}
            <div class="comments-section">
                <div id="comments-${post.id}">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input id="comment-input-${post.id}" type="text" placeholder="${translations[currentLang].writeComment || "Write a comment..."}" onkeypress="if(event.key === 'Enter') addComment('${post.id}')">
                    <button onclick="addComment('${post.id}')" class="comment-add-btn">+</button>
                </div>
            </div>
        `;
        feedContainer.appendChild(postEl);
    });

    // 🗑️ ХОГИЙН САНГИЙН АРХИВ ХЭСЭГ
    const myDeletedPosts = deletedPostsArchive.filter(p => currentUser && p.author === currentUser.username);
    if (myDeletedPosts.length > 0) {
        const archiveTitle = document.createElement('h3');
        archiveTitle.style.cssText = "margin-top:40px; color:var(--cyber-magenta); font-size:14px; border-bottom:1px solid var(--border-color); padding-bottom:8px;";
        archiveTitle.innerText = currentLang === 'mn' ? "🗑️ Устгасан постуудын архив (Зөвхөн танд харагдана):" : "🗑️ Your Deleted Posts Archive:";
        feedContainer.appendChild(archiveTitle);

        myDeletedPosts.forEach(post => {
            const archEl = document.createElement('div');
            archEl.className = "post-card";
            archEl.style.opacity = "0.6";
            
            archEl.innerHTML = `
                <div class="post-header-row">
                    <div class="post-user-info">
                        <div class="post-meta-text">
                            <h4 style="color:var(--text-gray);">${post.author} (Deleted)</h4>
                            <span>📅 ${timeAgo(post.timestamp)}</span>
                        </div>
                    </div>
                    <div>
                        <button onclick="restorePost('${post.id}')" class="vote-btn-neon" style="color:var(--cyber-cyan); border-color:var(--cyber-cyan);">🔄 Restore Post</button>
                    </div>
                </div>
                <p class="post-main-text" style="text-decoration: line-through; color:var(--text-gray);">${post.text}</p>
            `;
            feedContainer.appendChild(archEl);
        });
    }
}
function votePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        post.votes += 1;
        localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
        renderPosts();
    }
}

function addComment(postId) {
    const inputEl = document.getElementById(`comment-input-${postId}`);
    const text = inputEl ? inputEl.value.trim() : "";
    if (!text) return;

    const post = allPosts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            author: currentUser ? currentUser.username : "Anonymous",
            text: text,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
        if (inputEl) inputEl.value = "";
        renderPosts();
    }
}

// 🤝 НАЙЗУУДЫН СИСТЕМ
function loadFriendsList() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    let usersDb = [];
    try { usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || []; } catch (e) { usersDb = []; }

    const onlineFriends = usersDb.filter(u => u.username.toLowerCase() !== currentUser.username.toLowerCase());

    if (onlineFriends.length === 0) {
        container.innerHTML = `<div style="font-size:12px; color:var(--text-gray); padding:10px;">No citizens online.</div>`;
        return;
    }

    onlineFriends.forEach(user => {
        const row = document.createElement('div');
        row.className = "friend-item-row" + (selectedFriend === user.username ? " active" : "");
        row.onclick = () => selectFriendToChat(user.username);
        row.innerHTML = `<img src="${user.avatar}" class="friend-avatar-mini"> <span>${user.username}</span>`;
        container.appendChild(row);
    });
}

function selectFriendToChat(friendName) {
    selectedFriend = friendName;
    const header = document.getElementById('active-chat-partner');
    if (header) header.innerText = `💬 Chat with: ${friendName}`;
    loadFriendsList();
    renderFriendMessages();
}

function renderFriendMessages() {
    const box = document.getElementById('friends-chat-messages');
    if (!box || !selectedFriend) return;
    box.innerHTML = "";

    let chatKey = [currentUser.username, selectedFriend].sort().join("_chat_");
    let messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    messages.forEach(m => {
        const div = document.createElement('div');
        div.className = "msg-row " + (m.sender === currentUser.username ? "user" : "friend-msg");
        div.innerHTML = `<strong>${m.sender}:</strong> ${m.text}`;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}

function sendFriendMessage() {
    const inputEl = document.getElementById('friends-chat-input');
    const text = inputEl ? inputEl.value.trim() : "";
    if (!text || !selectedFriend) return;

    let chatKey = [currentUser.username, selectedFriend].sort().join("_chat_");
    let messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    messages.push({ sender: currentUser.username, text: text });
    localStorage.setItem(chatKey, JSON.stringify(messages));
    if (inputEl) inputEl.value = "";
    renderFriendMessages();
}

// 🤖 ЖИНХЭНЭ УХААЛАГ, ЧӨЛӨӨТЭЙ ХАРИЛЦДАГ AI БОТ
async function sendDirectMessage() {
    const inputEl = document.getElementById('bot-input');
    const msg = inputEl ? inputEl.value.trim() : "";
    if (!msg) return;

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    const userRow = document.createElement('div');
    userRow.className = "msg-row user";
    userRow.innerHTML = `<strong>You:</strong> ${msg}`;
    chatContainer.appendChild(userRow);
    if (inputEl) inputEl.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const botRow = document.createElement('div');
    botRow.className = "msg-row bot";
    botRow.innerHTML = `<strong>Future Bot:</strong> ⚡ AI Matrix connecting...`;
    chatContainer.appendChild(botRow);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                inputs: `<|system|>\nYou are Future Bot, a highly intelligent futuristic AI guide on the social website iKnowTomorrow. Speak naturally, deep, and beautifully like ChatGPT. Respond instantly to any inquiry. If the user speaks Mongolian, reply in Mongolian. If English, reply in English.\n<|user|>\n${msg}\n<|assistant|>\n`,
                parameters: { max_new_tokens: 220, temperature: 0.7 }
            })
        });

        const data = await response.json();
        let aiReply = "";

        if (data && data.generated_text) {
            const parts = data.generated_text.split("<|assistant|>\n");
            aiReply = parts[parts.length - 1] || data.generated_text;
        } else if (Array.isArray(data) && data?.generated_text) {
            const parts = data.generated_text.split("<|assistant|>\n");
            aiReply = parts[parts.length - 1] || data.generated_text;
        } else {
            aiReply = "Quantum signals are shifting in the timeline. Please re-enter your prophecy.";
        }

        botRow.innerHTML = `<strong>Future Bot:</strong> ${aiReply.trim()}`;
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        const contextualReplies = [
            "Маш сонирхолтой асуулт байна. Миний квант симуляциар үүний ирээдүйд биелэх магадлал 94.2% байна шүү.",
            "Кибер орон зайд энэ тухай маш их мэдээлэл байна. Цаг хугацааны шугам маш хурдтай хувьсаж байна.",
            "Би таныг маш сайн ойлголоо. Хүн төрөлхтний дараагийн алхам яг үүн рүү чиглэх болов уу. Keep exploring!"
        ];
        const botBackupReply = contextualReplies[Math.floor(Math.random() * contextualReplies.length)];
        botRow.innerHTML = `<strong>Future Bot:</strong> ${botBackupReply}`;
    }
}

// 🎲 REFRESH ХИЙХ БОЛГОНД БАРУУН, ЗҮҮН, ГОЛЫН ЗУРГИЙГ ЗЭРЭГ СОЛИХ СИСТЕМ
function randomizeAuthImages() {
    const authContainer = document.getElementById('auth-container');
    const authCard = document.querySelector('.auth-card');
    if (!authContainer || !authCard) return;

    const cyberImages = [
        'Designer.png', 'Designer (1).png', 'Designer (2).png', 'Designer (3).png',
        'Designer (4).png', 'Designer (5).png', 'Designer (6).png', 'Designer (7).png',
        'Designer (8).png', 'Designer (9).png', 'Designer (10).png', 'future, kids art, kids paint, happy tomorrow.png'
    ];

    const shuffled = [...cyberImages].sort(() => 0.5 - Math.random());

    const leftImg = shuffled[0];
    const rightImg = shuffled[1];
    const centerImg = shuffled[2]; // 🎯 Индекстэй төгс холболт

    authContainer.style.backgroundImage = "url('" + leftImg + "'), url('" + rightImg + "'), radial-gradient(circle at center, #051405 0%, #020502 100%)";
    authContainer.style.backgroundPosition = 'left center, right center, center center';
    authContainer.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat';
    authContainer.style.backgroundSize = '32% 100%, 32% 100%, cover'; 

    authCard.style.backgroundImage = "url('" + centerImg + "')";
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_current_user');
    showAuthPage('login');
}

// Систем ачаалагдах үед зургийг шууд холино
document.addEventListener('DOMContentLoaded', () => {
    randomizeAuthImages();
});
