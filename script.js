// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'en';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let db = null; 

// Translations Database
const translations = {
    en: { feed: "Timeline", friends: "🤝 Friends & Chats", chats: "🤖 Future Bot", futurePlaceholder: "What will happen in the future? Share here...", postBtn: "Post", verifiedFuture: "Verified Future", writeComment: "Write a comment...", botTitle: "Future Bot 🤖", sendBtn: "Send", bannedWordAlert: "Your post contains banned keywords!", searchLabel: "Search Timeline...", exitBtn: "🚪 Exit" },
    mn: { feed: "Таймлайн", friends: "🤝 Түншүүд ба Чат", chats: "🤖 Ирээдүйн Бот", futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...", postBtn: "Нийтлэх", verifiedFuture: "Ирээдүй биелсэн", writeComment: "Сэтгэгдэл үлдээх...", botTitle: "Ирээдүйн Бот 🤖", sendBtn: "Илгээх", bannedWordAlert: "Таны бичвэрт хориотой үг байна!", searchLabel: "Таймлайнаас хайх...", exitBtn: "🚪 Гарах" }
};

const authImages = ['Designer (1).png', 'Designer (2).png', 'Designer (3).png', 'Designer (4).png', 'Designer (5).png', 'Designer.png'];
let attachedMedia = null, attachedMediaType = null, modalAttachedAvatar = null;
const bannedKeywords = ["altsgar", "golog", "pizda", "зда", "лайн", "пизда"];

// 🔄 Window Load
window.onload = function() {
    initIndexedDB();
    setupPasswordToggles();
};

// 🔐 BACKGROUND IMAGES
function initAuthPage() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    let shuffled = [...authImages].sort(() => 0.5 - Math.random());
    authContainer.style.backgroundImage = `url('${shuffled[0]}'), url('${shuffled[1]}'), url('${shuffled[2]}')`;
    
    if (document.getElementById('login-card')) document.getElementById('login-card').style.backgroundImage = `url('${shuffled[2]}')`;
    if (document.getElementById('register-card')) document.getElementById('register-card').style.backgroundImage = `url('${shuffled[2]}')`;
}

function showAuthPage(type) {
    document.getElementById('login-card').style.display = type === 'register' ? 'none' : 'block';
    document.getElementById('register-card').style.display = type === 'register' ? 'block' : 'none';
}

// 📦 INDEXEDDB СУУРИЛУУЛАХ БОЛОН ШАЛГАХ
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 3);
    request.onsuccess = function(e) {
        db = e.target.result;
        initAuthPage(); 
        setupFormListeners(); 
        
        // Бааз бэлэн болмогц сессийг шалгана
        let loggedName = localStorage.getItem('iknow_logged_user');
        if(loggedName) {
            let tx = db.transaction(["users"], "readonly");
            tx.objectStore("users").get(loggedName).onsuccess = function(event) {
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

// 🎮 ФОРМ СОНСОХ ХЭСЭГ (SUBMIT)
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
    initAuthPage();
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
    document.getElementById('friends-btn').innerText = lang.friends;
    document.getElementById('chats-btn').innerText = lang.chats;
    document.getElementById('future-input').placeholder = lang.futurePlaceholder;
    document.getElementById('post-btn').innerText = lang.postBtn;
    document.getElementById('bot-title').innerText = lang.botTitle;
    document.getElementById('send-btn').innerText = lang.sendBtn;
    document.getElementById('search-input').placeholder = lang.searchLabel;
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
    if(!input.value && !attachedMedia) return;
    if(bannedKeywords.some(w => input.value.toLowerCase().includes(w))) { alert(translations[currentLang].bannedWordAlert); return; }

    let newPost = { id: "post_" + Date.now(), author: currentUser.username, avatar: currentUser.avatar, text: input.value, media: attachedMedia, mediaType: attachedMediaType, timestamp: Date.now(), votes: 0, voters: [], comments: [] };
    
    db.transaction(["posts"], "readwrite").objectStore("posts").add(newPost).onsuccess = function() {
        input.value = ''; clearAttachedMedia(); loadPostsFromDB();
    };
}

function renderFeed(posts) {
    const container = document.getElementById('feed-container');
    if(!container) return; container.innerHTML = '';
    posts.forEach(p => {
        let card = document.createElement('div');
        card.className = "post-card tier-electric";
        card.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img class="post-avatar-mini" src="${p.avatar}">
                    <div><h4>${p.author}</h4><span>${new Date(p.timestamp).toLocaleTimeString()}</span></div>
                </div>
                <button class="delete-btn-red" style="display:${p.author===currentUser.username?'block':'none'}" onclick="deletePost('${p.id}')">❌</button>
            </div>
            <div class="post-main-text">${p.text}</div>
            <div class="comments-section">
                <div class="comment-input-row">
                    <input id="reply-input-${p.id}" type="text" placeholder="Comment...">
                    <button class="comment-add-btn" onclick="addComment('${p.id}')">➔</button>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function deletePost(id) {
    if(confirm("Delete post?")) db.transaction(["posts"], "readwrite").objectStore("posts").delete(id).onsuccess = () => loadPostsFromDB();
}

// 🖼️ MEDIA PREVIEW
function handleFileSelect(event, type) {
    let file = event.target.files[0]; if(!file) return;
    let r = new FileReader();
    r.onload = function(e) {
        attachedMedia = e.target.result; attachedMediaType = type;
        document.getElementById('post-media-preview-box').style.display = 'block';
        let img = document.getElementById('post-image-preview-img'), vid = document.getElementById('post-video-preview-vid');
        img.style.display = type === 'image' ? 'block' : 'none'; if(type==='image') img.src = e.target.result;
        vid.style.display = type === 'video' ? 'block' : 'none'; if(type==='video') vid.src = e.target.result;
    };
    r.readAsDataURL(file);
}
function clearAttachedMedia() { attachedMedia = null; document.getElementById('post-media-preview-box').style.display = 'none'; }

// 🤖 AI & CHAT SHUMS
function sendDirectMessage() {
    let box = document.getElementById('chat-container'), input = document.getElementById('bot-input');
    if(!input.value) return;
    box.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${input.value}</div>`;
    input.value = ''; box.scrollTop = box.scrollHeight;
    setTimeout(() => { box.innerHTML += `<div class="msg-row bot"><strong>Bot:</strong> Calculations active. Future looks stable.</div>`; box.scrollTop = box.scrollHeight; }, 700);
}
function loadOnlineCitizens() {} function openProfileModal() {} function closeProfileModal() {}
