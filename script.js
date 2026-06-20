// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'en';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let attachedMedia = null;
let attachedMediaType = null;

// Translations Database
const translations = {
    en: { feed: "Timeline", chats: "🤖 Future Bot", futurePlaceholder: "What will happen in the future? Share here...", postBtn: "Post", writeComment: "Write a comment...", botTitle: "Future Bot 🤖", sendBtn: "Send", bannedWordAlert: "Your post contains banned keywords!" },
    mn: { feed: "Таймлайн", chats: "🤖 Ирээдүйн Бот", futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...", postBtn: "Нийтлэх", writeComment: "Сэтгэгдэл үлдээх...", botTitle: "Ирээдүйн Бот 🤖", sendBtn: "Илгээх", bannedWordAlert: "Таны бичвэрт хориотой үг байна!" }
};

const authImages = ['Designer (1).png', 'Designer (2).png', 'Designer (3).png', 'Designer (4).png', 'Designer (5).png', 'Designer.png'];
const bannedKeywords = ["altsgar", "golog", "pizda", "зда", "лайн", "пизда"];

// 🔄 Window Load
window.onload = function() {
    initAuthPage(); // Арын зургуудыг оруулж ирэх функц
    setupFormListeners();
    setupPasswordToggles();
    checkLoginStatus();
};

// 🔐 BACKGROUND IMAGES
function initAuthPage() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    let shuffled = [...authImages].sort(() => 0.5 - Math.random());
    authContainer.style.backgroundImage = `url('${shuffled[0]}'), url('${shuffled[1]}'), url('${shuffled[2]}')`;
    
    if (document.getElementById('login-card')) document.getElementById('login-card').style.backgroundImage = `url('${shuffled[2]}')`;
    if (document.getElementById('register-card')) document.getElementById('register-card').style.backgroundImage = `url('${shuffled[3]}')`;
}

function showAuthPage(type) {
    document.getElementById('login-card').style.display = type === 'register' ? 'none' : 'block';
    document.getElementById('register-card').style.display = type === 'register' ? 'block' : 'none';
}

// 🎮 ФОРМ СОНСОХ ХЭСЭГ
function setupFormListeners() {
    document.getElementById('login-form').onsubmit = function(e) {
        e.preventDefault();
        handleLogin();
    };
    document.getElementById('register-form').onsubmit = function(e) {
        e.preventDefault();
        handleRegister();
    };
}

// 👀 PASSWORD TOGGLE
function setupPasswordToggles() {
    document.getElementById('toggleLoginPassword').onclick = function() {
        let input = document.getElementById('login-password');
        input.type = input.type === 'password' ? 'text' : 'password';
        this.classList.toggle('fa-eye-slash');
    };
    document.getElementById('toggleRegPassword').onclick = function() {
        let input = document.getElementById('reg-password');
        input.type = input.type === 'password' ? 'text' : 'password';
        this.classList.toggle('fa-eye-slash');
    };
}

// 🔑 БҮРТГҮҮЛЭХ
function handleRegister() {
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    if(!u || !p) return;

    let users = JSON.parse(localStorage.getItem('iknow_users') || '{}');
    
    if(users[u]) {
        alert("Username already exists!");
    } else {
        users[u] = { username: u, password: p, avatar: 'Designer.png' };
        localStorage.setItem('iknow_users', JSON.stringify(users));
        alert("Registration Successful!");
        document.getElementById('register-form').reset();
        showAuthPage('login');
    }
}

// 🔑 НЭВТРЭХ
function handleLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if(!u || !p) return;

    let users = JSON.parse(localStorage.getItem('iknow_users') || '{}');
    let user = users[u];

    if(user && user.password === p) {
        currentUser = user;
        localStorage.setItem('iknow_logged_user', u);
        document.getElementById('login-form').reset();
        showMainApp();
    } else {
        alert("Invalid Username or Password!");
    }
}

function checkLoginStatus() {
    let loggedName = localStorage.getItem('iknow_logged_user');
    let users = JSON.parse(localStorage.getItem('iknow_users') || '{}');
    
    if(loggedName && users[loggedName]) {
        currentUser = users[loggedName];
        showMainApp();
    } else {
        showAuthPage('login');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_logged_user');
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    initAuthPage();
    showAuthPage('login');
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    applyTheme(currentTheme);
    updateLanguageUI();
    document.getElementById('profile-name').innerText = currentUser.username;
    document.getElementById('profile-avatar').src = currentUser.avatar;
    renderFeed();
}

// 🔀 LANG & THEME
function updateLanguageUI() {
    let lang = translations[currentLang];
    document.getElementById('feed-btn').innerText = lang.feed;
    document.getElementById('chats-btn').innerText = lang.chats;
    document.getElementById('future-input').placeholder = lang.futurePlaceholder;
    document.getElementById('post-btn').innerText = lang.postBtn;
    document.getElementById('bot-title').innerText = lang.botTitle;
    document.getElementById('send-btn').innerText = lang.sendBtn;
}
function switchLang() {
    currentLang = currentLang === 'en' ? 'mn' : 'en';
    localStorage.setItem('iknow_lang', currentLang);
    document.getElementById('lang-btn').innerText = currentLang === 'en' ? 'English' : 'Монгол';
    updateLanguageUI();
}
function toggleTheme() {
    currentTheme = currentTheme === 'cyber' ? 'matrix' : (currentTheme === 'matrix' ? 'dark' : 'cyber');
    localStorage.setItem('iknow_theme', currentTheme);
    applyTheme(currentTheme);
}
function applyTheme(theme) {
    document.body.className = 'theme-' + theme;
    if(document.getElementById('theme-btn')) document.getElementById('theme-btn').innerText = "🎨 Theme: " + theme.toUpperCase();
}
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.menu-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).style.display = 'block';
    document.getElementById(tab + '-btn').classList.add('active');
}

// 📝 POSTS & COMMENTS SYSTEM (Хуучин функцуудыг бүрэн буцааж оруулав)
function createPost() {
    const input = document.getElementById('future-input');
    if(!input.value && !attachedMedia) return;
    if(bannedKeywords.some(w => input.value.toLowerCase().includes(w))) { alert(translations[currentLang].bannedWordAlert); return; }

    let posts = JSON.parse(localStorage.getItem('iknow_posts') || '[]');
    let newPost = { 
        id: "post_" + Date.now(), 
        author: currentUser.username, 
        avatar: currentUser.avatar, 
        text: input.value, 
        media: attachedMedia,
        mediaType: attachedMediaType,
        timestamp: Date.now(),
        comments: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('iknow_posts', JSON.stringify(posts));
    input.value = ''; 
    clearAttachedMedia();
    renderFeed();
}

function renderFeed() {
    const container = document.getElementById('feed-container');
    if(!container) return; container.innerHTML = '';
    
    let posts = JSON.parse(localStorage.getItem('iknow_posts') || '[]');
    
    posts.forEach(p => {
        let card = document.createElement('div');
        card.className = "post-card tier-electric";
        card.style.border = "1px solid var(--cyber-cyan)";
        card.style.padding = "15px";
        card.style.marginBottom = "15px";
        card.style.background = "rgba(0,0,0,0.6)";
        card.style.borderRadius = "8px";

        // Медиа хавсралт шалгах
        let mediaHtml = '';
        if(p.media) {
            if(p.mediaType === 'image') {
                mediaHtml = `<img src="${p.media}" style="max-width:100%; margin-top:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">`;
            } else if(p.mediaType === 'video') {
                mediaHtml = `<video src="${p.media}" controls style="max-width:100%; margin-top:10px; border-radius:4px;"></video>`;
            }
        }

        // Сэтгэгдлийн жагсаалт үүсгэх
        let commentsHtml = '';
        if(p.comments && p.comments.length > 0) {
            p.comments.forEach(c => {
                commentsHtml += `
                    <div style="background:rgba(255,255,255,0.05); padding:8px; margin-top:5px; border-radius:4px; font-size:13px;">
                        <strong>${c.author}:</strong> ${c.text}
                    </div>`;
            });
        }
        
        card.innerHTML = `
            <div class="post-header-row" style="display:flex; justify-content:space-between; align-items:center;">
                <div class="post-user-info" style="display:flex; gap:10px; align-items:center;">
                    <img class="post-avatar-mini" src="${p.avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <div><h4 style="margin:0;">${p.author}</h4><span style="font-size:11px; color:#888;">${new Date(p.timestamp).toLocaleTimeString()}</span></div>
                </div>
                <button class="delete-btn-red" style="display:${p.author===currentUser.username?'block':'none'}; background:red; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;" onclick="deletePost('${p.id}')">❌</button>
            </div>
            <div class="post-main-text" style="margin-top:10px; font-size:14px; white-space: pre-wrap;">${p.text}</div>
            ${mediaHtml}
            
            <div class="comments-section" style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <div id="comments-list-${p.id}">${commentsHtml}</div>
                <div class="comment-input-row" style="display:flex; gap:5px; margin-top:8px;">
                    <input id="reply-input-${p.id}" type="text" placeholder="Write a comment..." style="margin-bottom:0; padding:6px 10px; font-size:13px;">
                    <button style="background:var(--cyber-cyan); color:#000; border:none; padding:0 15px; cursor:pointer; border-radius:4px;" onclick="addComment('${p.id}')">➔</button>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function deletePost(id) {
    if(confirm("Delete post?")) {
        let posts = JSON.parse(localStorage.getItem('iknow_posts') || '[]');
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderFeed();
    }
}

function addComment(postId) {
    const input = document.getElementById(`reply-input-${postId}`);
    if(!input || !input.value.trim()) return;

    let posts = JSON.parse(localStorage.getItem('iknow_posts') || '[]');
    let postIndex = posts.findIndex(p => p.id === postId);
    
    if(postIndex !== -1) {
        if(!posts[postIndex].comments) posts[postIndex].comments = [];
        posts[postIndex].comments.push({
            author: currentUser.username,
            text: input.value.trim(),
            timestamp: Date.now()
        });
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        input.value = '';
        renderFeed();
    }
}

// 🖼️ МЕДИА ХАВСРАЛТ УНШИХ
function handleFileSelect(event, type) {
    let file = event.target.files[0]; 
    if(!file) return;
    let r = new FileReader();
    r.onload = function(e) {
        attachedMedia = e.target.result; 
        attachedMediaType = type;
        alert(type.toUpperCase() + " attached successfully!");
    };
    r.readAsDataURL(file);
}
function clearAttachedMedia() { 
    attachedMedia = null; 
    attachedMediaType = null; 
}

// 🤖 AI BOT
function sendDirectMessage() {
    let box = document.getElementById('chat-container'), input = document.getElementById('bot-input');
    if(!input.value) return;
    box.innerHTML += `<div class="msg-row user" style="margin-bottom:8px; text-align:right;"><strong>You:</strong> ${input.value}</div>`;
    input.value = ''; box.scrollTop = box.scrollHeight;
    setTimeout(() => { box.innerHTML += `<div class="msg-row bot" style="margin-bottom:8px; color:var(--cyber-cyan);"><strong>Bot:</strong> Calculations active. Future looks stable.</div>`; box.scrollTop = box.scrollHeight; }, 700);
}
