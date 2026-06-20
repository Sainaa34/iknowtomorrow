// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'en';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;

// Translations Database
const translations = {
    en: { feed: "Timeline", chats: "🤖 Future Bot", futurePlaceholder: "What will happen in the future? Share here...", postBtn: "Post", writeComment: "Write a comment...", botTitle: "Future Bot 🤖", sendBtn: "Send", bannedWordAlert: "Your post contains banned keywords!" },
    mn: { feed: "Таймлайн", chats: "🤖 Ирээдүйн Бот", futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...", postBtn: "Нийтлэх", writeComment: "Сэтгэгдэл үлдээх...", botTitle: "Ирээдүйн Бот 🤖", sendBtn: "Илгээх", bannedWordAlert: "Таны бичвэрт хориотой үг байна!" }
};

const bannedKeywords = ["altsgar", "golog", "pizda", "зда", "лайн", "пизда"];

// 🔄 Window Load - Шууд ажиллана, бааз хүлээхгүй
window.onload = function() {
    setupFormListeners();
    setupPasswordToggles();
    checkLoginStatus();
};

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

// 🔑 БҮРТГҮҮЛЭХ (localStorage ашиглав)
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

// 🔑 НЭВТРЭХ (localStorage ашиглав)
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

// 📝 POSTS SYSTEM (localStorage)
function createPost() {
    const input = document.getElementById('future-input');
    if(!input.value) return;
    if(bannedKeywords.some(w => input.value.toLowerCase().includes(w))) { alert(translations[currentLang].bannedWordAlert); return; }

    let posts = JSON.parse(localStorage.getItem('iknow_posts') || '[]');
    let newPost = { id: "post_" + Date.now(), author: currentUser.username, avatar: currentUser.avatar, text: input.value, timestamp: Date.now() };
    
    posts.unshift(newPost);
    localStorage.setItem('iknow_posts', JSON.stringify(posts));
    input.value = ''; 
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
        card.style.marginBottom = "10px";
        card.style.background = "rgba(0,0,0,0.5)";
        card.innerHTML = `
            <div class="post-header-row" style="display:flex; justify-content:space-between; align-items:center;">
                <div class="post-user-info" style="display:flex; gap:10px; align-items:center;">
                    <img class="post-avatar-mini" src="${p.avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <div><h4 style="margin:0;">${p.author}</h4><span style="font-size:11px; color:#888;">${new Date(p.timestamp).toLocaleTimeString()}</span></div>
                </div>
                <button class="delete-btn-red" style="display:${p.author===currentUser.username?'block':'none'}; background:red; color:white; border:none; padding:5px 10px; cursor:pointer;" onclick="deletePost('${p.id}')">❌</button>
            </div>
            <div class="post-main-text" style="margin-top:10px; font-size:14px;">${p.text}</div>`;
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

// 🤖 AI BOT
function sendDirectMessage() {
    let box = document.getElementById('chat-container'), input = document.getElementById('bot-input');
    if(!input.value) return;
    box.innerHTML += `<div class="msg-row user" style="margin-bottom:8px; text-align:right;"><strong>You:</strong> ${input.value}</div>`;
    input.value = ''; box.scrollTop = box.scrollHeight;
    setTimeout(() => { box.innerHTML += `<div class="msg-row bot" style="margin-bottom:8px; color:var(--cyber-cyan);"><strong>Bot:</strong> Calculations active. Future looks stable.</div>`; box.scrollTop = box.scrollHeight; }, 700);
}
