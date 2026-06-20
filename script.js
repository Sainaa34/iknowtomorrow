// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'en';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let db = null; 

// Translations Database
const translations = {
    en: { feed: "Timeline", chats: "🤖 Future Bot", futurePlaceholder: "What will happen in the future? Share here...", postBtn: "Post", writeComment: "Write a comment...", botTitle: "Future Bot 🤖", sendBtn: "Send", bannedWordAlert: "Your post contains banned keywords!" },
    mn: { feed: "Таймлайн", chats: "🤖 Ирээдүйн Бот", futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...", postBtn: "Нийтлэх", writeComment: "Сэтгэгдэл үлдээх...", botTitle: "Ирээдүйн Бот 🤖", sendBtn: "Илгээх", bannedWordAlert: "Таны бичвэрт хориотой үг байна!" }
};

const bannedKeywords = ["altsgar", "golog", "pizda", "зда", "лайн", "пизда"];

// 🔄 Window Load
window.onload = function() {
    initIndexedDB();
    setupPasswordToggles();
};

function showAuthPage(type) {
    document.getElementById('login-card').style.display = type === 'register' ? 'none' : 'block';
    document.getElementById('register-card').style.display = type === 'register' ? 'block' : 'none';
}

// 📦 INDEXEDDB СУУРИЛУУЛАХ
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 3);
    request.onsuccess = function(e) {
        db = e.target.result;
        setupFormListeners(); 
        
        let loggedName = localStorage.getItem('iknow_logged_user');
        if(loggedName) {
            db.transaction(["users"], "readonly").objectStore("users").get(loggedName).onsuccess = function(event) {
                if(event.target.result) {
                    currentUser = event.target.result;
                    showMainApp();
                } else { showAuthPage('login'); }
            };
        } else { showAuthPage('login'); }
    };
    request.onupgradeneeded = function(e) {
        let dbInstance = e.target.result;
        if (!dbInstance.objectStoreNames.contains("users")) dbInstance.createObjectStore("users", { keyPath: "username" });
        if (!dbInstance.objectStoreNames.contains("posts")) dbInstance.createObjectStore("posts", { keyPath: "id" });
    };
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
    if(!db) return;
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    if(!u || !p) return;

    let tx = db.transaction(["users"], "readwrite");
    let store = tx.objectStore("users");
    
    store.get(u).onsuccess = function(e) {
        if(e.target.result) {
            alert("Username already exists!");
        } else {
            store.add({ username: u, password: p, avatar: 'Designer.png' }).onsuccess = function() {
                alert("Registration Successful!");
                document.getElementById('register-form').reset();
                showAuthPage('login');
            };
        }
    };
}

// 🔑 НЭВТРЭХ
function handleLogin() {
    if(!db) return;
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if(!u || !p) return;

    let tx = db.transaction(["users"], "readonly");
    tx.objectStore("users").get(u).onsuccess = function(e) {
        let user = e.target.result;
        if(user && user.password === p) {
            currentUser = user;
            localStorage.setItem('iknow_logged_user', u);
            document.getElementById('login-form').reset();
            showMainApp();
        } else {
            alert("Invalid Username or Password!");
        }
    };
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_logged_user');
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    applyTheme(currentTheme);
    updateLanguageUI();
    document.getElementById('profile-name').innerText = currentUser.username;
    document.getElementById('profile-avatar').src = currentUser.avatar;
    loadPostsFromDB();
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

// 📝 POSTS SYSTEM
function loadPostsFromDB() {
    if (!db) return;
    db.transaction(["posts"], "readonly").objectStore("posts").getAll().onsuccess = function(e) {
        allPosts = e.target.result || [];
        allPosts.sort((a,b) => b.timestamp - a.timestamp);
        renderFeed(allPosts);
    };
}

function createPost() {
    const input = document.getElementById('future-input');
    if(!input.value) return;
    if(bannedKeywords.some(w => input.value.toLowerCase().includes(w))) { alert(translations[currentLang].bannedWordAlert); return; }

    let newPost = { id: "post_" + Date.now(), author: currentUser.username, avatar: currentUser.avatar, text: input.value, timestamp: Date.now(), comments: [] };
    
    db.transaction(["posts"], "readwrite").objectStore("posts").add(newPost).onsuccess = function() {
        input.value = ''; loadPostsFromDB();
    };
}

function renderFeed(posts) {
    const container = document.getElementById('feed-container');
    if(!container) return; container.innerHTML = '';
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
                    <img class="post-avatar-mini" src="${p.avatar}" style="width:4px0; height:40px; border-radius:50%;">
                    <div><h4 style="margin:0;">${p.author}</h4><span style="font-size:11px; color:#888;">${new Date(p.timestamp).toLocaleTimeString()}</span></div>
                </div>
                <button class="delete-btn-red" style="display:${p.author===currentUser.username?'block':'none'}; background:red; color:white; border:none; padding:5px 10px; cursor:pointer;" onclick="deletePost('${p.id}')">❌</button>
            </div>
            <div class="post-main-text" style="margin-top:10px; font-size:14px;">${p.text}</div>`;
        container.appendChild(card);
    });
}

function deletePost(id) {
    if(confirm("Delete post?")) db.transaction(["posts"], "readwrite").objectStore("posts").delete(id).onsuccess = () => loadPostsFromDB();
}

// 🤖 AI BOT
function sendDirectMessage() {
    let box = document.getElementById('chat-container'), input = document.getElementById('bot-input');
    if(!input.value) return;
    box.innerHTML += `<div class="msg-row user" style="margin-bottom:8px; text-align:right;"><strong>You:</strong> ${input.value}</div>`;
    let userText = input.value; input.value = ''; box.scrollTop = box.scrollHeight;
    setTimeout(() => { box.innerHTML += `<div class="msg-row bot" style="margin-bottom:8px; color:var(--cyber-cyan);"><strong>Bot:</strong> Calculations active. Future looks stable.</div>`; box.scrollTop = box.scrollHeight; }, 700);
}
