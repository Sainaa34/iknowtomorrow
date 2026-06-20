// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let currentUser = null;
let allPosts = [];
let currentTab = 'feed';

// Translations Database
const translations = {
    en: {
        feed: "Feed",
        myPosts: "My Posts",
        friends: "Friends",
        chats: "Chats",
        profileSettings: "Profile Settings",
        futurePlaceholder: "What will happen in the future? Share here...",
        imageBtn: "Image",
        videoBtn: "Video",
        postBtn: "Post",
        predictionsTitle: "📌 My Predictions",
        verifiedFuture: "Verified Future",
        comments: "Comments",
        writeComment: "Write a comment...",
        botTitle: "Future Bot 🤖",
        botPlaceholder: "Ask about the future...",
        sendBtn: "Send",
        syncTitle: "Cyborg Memory Sync",
        syncStatus: "Sync level:",
        loginTitle: "Login to iKnowTomorrow",
        registerTitle: "Create Account",
        usernameLabel: "Username",
        passwordLabel: "Password",
        loginBtn: "Login",
        registerBtn: "Register",
        toggleToRegister: "Don't have an account? Register here",
        toggleToLogin: "Already have an account? Login here",
        guestBtn: "Browse as Guest (Anonymous)",
        googleBtn: "Sign in with Google",
        fillAllFields: "Please fill all fields!",
        userExists: "Username already taken!",
        regSuccess: "Registration successful! Please login.",
        wrongCredentials: "Wrong username or password!",
        loginSuccess: "Login successful!",
        bannedWordAlert: "Your post contains banned keywords!",
        logoutBtn: "Exit",
        searchLabel: "Search Timeline..."
    },
    mn: {
        feed: "Тэжээл",
        myPosts: "Миний Постууд",
        friends: "Найзууд",
        chats: "Чат",
        profileSettings: "Профайл Тохиргоо",
        futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...",
        imageBtn: "Зураг",
        videoBtn: "Видео",
        postBtn: "Нийтлэх",
        predictionsTitle: "📌 Миний Таамаглалууд",
        verifiedFuture: "Баталгаажсан Ирээдүй",
        comments: "Сэтгэгдэл",
        writeComment: "Сэтгэгдэл бичих...",
        botTitle: "Ирээдүйн Бот 🤖",
        botPlaceholder: "Ирээдүйн талаар асуу...",
        sendBtn: "Илгээх",
        syncTitle: "Киборг Ой Санамжийн Синхрончлол",
        syncStatus: "Синхрон түвшин:",
        loginTitle: "iKnowTomorrow-д нэвтрэх",
        registerTitle: "Бүртгэл Үүсгэх",
        usernameLabel: "Хэрэглэгчийн нэр",
        passwordLabel: "Нууц үг",
        loginBtn: "Нэвтрэх",
        registerBtn: "Бүртгүүлэх",
        toggleToRegister: "Бүртгэлгүй юу? Энд бүртгүүлнэ үү",
        toggleToLogin: "Акаунт байгаа юу? Энд нэвтрэнэ үү",
        guestBtn: "Зочноор нэвтрэх",
        googleBtn: "Google-ээр нэвтрэх",
        fillAllFields: "Бүх талбарыг бөглөнө үү!",
        userExists: "Хэрэглэгчийн нэр ашиглагдсан байна!",
        regSuccess: "Бүртгэл амжилттай! Одоо нэвтрэнэ үү.",
        wrongCredentials: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна!",
        loginSuccess: "Амжилттай нэвтэрлээ!",
        bannedWordAlert: "Таны постонд хориотой үг байна!",
        logoutBtn: "Гарах",
        searchLabel: "Search Timeline..."
    }
};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

// App Core Init
document.addEventListener('DOMContentLoaded', () => {
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
        'feed-btn', 'chats-btn', 'profile-btn', 'image-btn', 'video-btn', 
        'post-btn', 'bot-title', 'send-btn', 'sync-title', 'login-title', 
        'reg-title', 'login-btn-text', 'reg-btn-text', 'toggle-reg', 
        'toggle-login', 'guest-btn', 'exit-btn'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let key = id.replace('-btn', '').replace('-title', '').replace('-text', '').replace('toggle-', 'toggleTo');
            if (id === 'feed-btn') key = 'feed';
            if (id === 'chats-btn') key = 'chats';
            if (id === 'profile-btn') key = 'profileSettings';
            if (id === 'image-btn') key = 'imageBtn';
            if (id === 'video-btn') key = 'videoBtn';
            if (id === 'post-btn') key = 'postBtn';
            if (id === 'send-btn') key = 'sendBtn';
            if (id === 'exit-btn') key = 'logoutBtn';
            
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
        alert(translations[currentLang].fillAllFields || "Please fill all fields!");
        return;
    }

    let usersDb = [];
    try {
        const rawData = localStorage.getItem('iknow_users_db');
        usersDb = rawData ? JSON.parse(rawData) : [];
    } catch (err) { usersDb = []; }

    const userExists = usersDb.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());
    if (userExists) {
        alert(translations[currentLang].userExists || "Username already taken!");
        return;
    }

    const newUser = {
        username: usernameInput,
        password: passwordInput,
        avatar: "https://robohash.org" + encodeURIComponent(usernameInput) + ".png?set=set4",
        syncPercentage: 0
    };
    
    usersDb.push(newUser);
    localStorage.setItem('iknow_users_db', JSON.stringify(usersDb));
    alert(translations[currentLang].regSuccess || "Registration successful!");
    showAuthPage('login');
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('login-username')?.value.trim();
    const passwordInput = document.getElementById('login-password')?.value;

    if (!usernameInput || !passwordInput) {
        alert(translations[currentLang].fillAllFields || "Please fill all fields!");
        return;
    }

    let usersDb = [];
    try {
        const rawData = localStorage.getItem('iknow_users_db');
        usersDb = rawData ? JSON.parse(rawData) : [];
    } catch (err) { usersDb = []; }

    const matchedUser = usersDb.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);

    if (matchedUser) {
        currentUser = matchedUser;
        localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert(translations[currentLang].wrongCredentials || "Wrong credentials!");
    }
}

function enterAsGuest() {
    currentUser = {
        username: "Guest_" + Math.floor(Math.random() * 900 + 100),
        avatar: "https://robohash.orgguest.png?set=set4",
        syncPercentage: 0
    };
    localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
    showMainApp();
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

function saveProfileModal() {
    const newName = document.getElementById('modal-username')?.value.trim();
    const newAvatar = document.getElementById('modal-avatar')?.value.trim();

    if (!newName) {
        alert("Username cannot be empty!");
        return;
    }

    let usersDb = [];
    try {
        const rawData = localStorage.getItem('iknow_users_db');
        usersDb = rawData ? JSON.parse(rawData) : [];
    } catch (err) { usersDb = []; }

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

    const activeBtn = document.getElementById(`${tabName === 'feed' ? 'feed' : 'chats'}-btn`);
    if (activeBtn) activeBtn.classList.add('active');
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

    updateSyncUI();
    loadPosts();
}

function loadPosts() {
    try {
        const rawPosts = localStorage.getItem('iknow_posts_db');
        allPosts = rawPosts ? JSON.parse(rawPosts) : [];
    } catch (e) { allPosts = []; }
    renderPosts();
}
let attachedMedia = null;
function previewMedia(type) {
    const mockUrl = prompt(type === 'image' ? "Enter image URL:" : "Enter video URL:");
    if (mockUrl) {
        attachedMedia = { type: type, url: mockUrl };
        alert(`${type === 'image' ? 'Image' : 'Video'} attached successfully!`);
    }
}

function createPost() {
    const inputEl = document.getElementById('future-input');
    const text = inputEl ? inputEl.value.trim() : "";

    if (!text && !attachedMedia) return;

    const hasBannedWord = bannedKeywords.some(word => text.toLowerCase().includes(word));
    if (hasBannedWord) {
        alert(translations[currentLang].bannedWordAlert || "Your post contains banned keywords!");
        return;
    }

    const newPost = {
        id: 'post_' + Date.now(),
        author: currentUser ? currentUser.username : "Anonymous",
        authorAvatar: currentUser ? currentUser.avatar : "https://robohash.org",
        text: text,
        media: attachedMedia,
        timestamp: new Date().toLocaleString(),
        votes: 0,
        comments: []
    };

    allPosts.unshift(newPost);
    localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));

    if (inputEl) inputEl.value = "";
    attachedMedia = null;

    renderPosts();
}

function searchPosts() {
    renderPosts();
}

function renderPosts() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = "";
    const searchVal = document.getElementById('search-input')?.value.toLowerCase() || "";

    // 🔍 Хайлтын шүүлтүүр
    let filteredPosts = allPosts.filter(post => 
        post.text.toLowerCase().includes(searchVal) || 
        post.author.toLowerCase().includes(searchVal)
    );

    // 🚀 TRENDING СИСТЕМ: Хамгийн олон санал авсан нь автоматаар хамгийн дээрээ гарна
    filteredPosts.sort((a, b) => b.votes - a.votes);

    filteredPosts.forEach(post => {
        const postEl = document.createElement('div');
        
        // 🔮 3 ШАТЛАЛТ ЭФФЕКТ (50 -> Гал, 500 -> Цахилгаан, 5000 -> Matrix Неон)
        let tierClass = "post-card";
        if (post.votes >= 5000) {
            tierClass += " tier-matrix";
        } else if (post.votes >= 500) {
            tierClass += " tier-electric";
        } else if (post.votes >= 50) {
            tierClass += " tier-fire";
        }
        postEl.className = tierClass;

        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') {
                mediaHtml = `<div class="post-media-content"><img src="${post.media.url}"></div>`;
            } else if (post.media.type === 'video') {
                mediaHtml = `<div class="post-media-content"><video src="${post.media.url}" controls></video></div>`;
            }
        }

        let commentsHtml = "";
        post.comments.forEach(c => {
            commentsHtml += `<div class="comment-node"><strong>${c.author}:</strong> ${c.text}</div>`;
        });

        const avatarUrl = post.authorAvatar || "https://robohash.org";

        postEl.innerHTML = `
            <div class="post-user-info">
                <img src="${avatarUrl}" class="post-avatar-mini">
                <div class="post-meta-text">
                    <h4>${post.author}</h4>
                    <span>${post.timestamp}</span>
                </div>
            </div>
            <p class="post-main-text">${post.text}</p>
            ${mediaHtml}
            <div>
                <button onclick="votePost('${post.id}')" class="vote-btn-neon">🔮 ${translations[currentLang].verifiedFuture || "Verified Future"} (${post.votes})</button>
            </div>
            <div class="comments-section">
                <div id="comments-${post.id}">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input id="comment-input-${post.id}" type="text" placeholder="${translations[currentLang].writeComment || "Write a comment..."}">
                    <button onclick="addComment('${post.id}')" class="comment-add-btn">+</button>
                </div>
            </div>
        `;
        feedContainer.appendChild(postEl);
    });
}
function votePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        post.votes += 1;
        
        // Киборг синхрон хувийг нэмэгдүүлэх симуляци
        if (currentUser) {
            currentUser.syncPercentage = Math.min(100, (currentUser.syncPercentage || 0) + 1);
            localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
            updateSyncUI();
        }
        
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
            text: text
        });
        localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
        if (inputEl) inputEl.value = "";
        renderPosts();
    }
}

// 🤖 ЭНГИЙН УХААЛАГ AI БОТ СИСТЕМ (Нууц үггүй, чөлөөтэй харилцана)
function sendDirectMessage() {
    const inputEl = document.getElementById('bot-input');
    const msg = inputEl ? inputEl.value.trim() : "";
    if (!msg) return;

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Хэрэглэгчийн мессеж
    const userRow = document.createElement('div');
    userRow.className = "msg-row user";
    userRow.innerHTML = `<strong>You:</strong> ${msg}`;
    chatContainer.appendChild(userRow);
    if (inputEl) inputEl.value = "";

    // Бот хариу өгөх хугацаа (Симуляци)
    setTimeout(() => {
        let botResponse = "Analyzing the cybernetic timeline... The digital currents are shifting.";
        const lowMsg = msg.toLowerCase();

        // Ухаалаг хариултуудын сан (ChatGPT симуляци)
        if (lowMsg.includes("hello") || lowMsg.includes("сайн уу")) {
            botResponse = "Greetings, chrononaut. I am the Future Bot. What insights into the synthetic era do you seek today?";
        } else if (lowMsg.includes("future") || lowMsg.includes("ирээдүй")) {
            botResponse = "In the upcoming cycle, decentralized consciousness and quantum cybernetics will define human civilization. Every timeline prediction changes the outcome.";
        } else if (lowMsg.includes("cyborg") || lowMsg.includes("киборг")) {
            botResponse = "The symbiosis of flesh and code is inevitable. Your memory sync level reflects your integration with the mainframe.";
        } else if (lowMsg.includes("ai") || lowMsg.includes("хиймэл оюун")) {
            botResponse = "Artificial Intelligence is no longer a tool; it is the fabric of the network you are browsing right now.";
        } else {
            botResponse = `Quantum matrix processed your query: "${msg}". Neural simulation predicts a 87.4% synchronization stability. Keep probing the timeline.`;
        }

        const botRow = document.createElement('div');
        botRow.className = "msg-row bot";
        botRow.innerHTML = `<strong>Future Bot:</strong> ${botResponse}`;
        chatContainer.appendChild(botRow);

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
}

function updateSyncUI() {
    const syncLevelText = document.getElementById('sync-level-text');
    const syncFill = document.getElementById('sync-fill');
    if (currentUser) {
        const percentage = currentUser.syncPercentage || 0;
        if (syncLevelText) syncLevelText.innerText = percentage + "%";
        if (syncFill) syncFill.style.width = percentage + "%";
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_current_user');
    showAuthPage('login');
}

// Хуучин товчлуурын холболтыг хамгаалах нэмэлт функц
function toggleLanguage() { 
    switchLang(); 
}
