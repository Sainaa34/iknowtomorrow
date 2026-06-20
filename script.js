// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let currentUser = null;
let allPosts = [];

// Translations Database
const translations = {
    en: {
        feed: "Feed",
        myPosts: "My Posts",
        friends: "Friends",
        chats: "Chats",
        profileSettings: "Profile Settings",
        futurePlaceholder: "What will happen in the future? Share here... (#ai or ?alien)",
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
        guestBtn: "Enter as Guest",
        googleBtn: "Sign in with Google",
        fillAllFields: "Please fill all fields!",
        userExists: "Username already taken!",
        regSuccess: "Registration successful! Please login.",
        wrongCredentials: "Wrong username or password!",
        loginSuccess: "Login successful!",
        bannedWordAlert: "Your post contains banned keywords!",
        logoutBtn: "Exit"
    },
    mn: {
        feed: "Тэжээл",
        myPosts: "Миний Постууд",
        friends: "Найзууд",
        chats: "Чат",
        profileSettings: "Профайл Тохиргоо",
        futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц... (#ai эсвэл ?alien)",
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
        logoutBtn: "Гарах"
    }
};

// Бот болон хориотой үгсийн тохиргоо
const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];
const secretKeywords = {
    "cyborg": 20,
    "matrix": 20,
    "singularity": 30,
    "timetravel": 30
};
// Хуудас ачаалагдахад ажиллах үндсэн хэсэг
document.addEventListener('DOMContentLoaded', () => {
    // Хадгалагдсан хэлийг шалгаж идэвхжүүлэх
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.innerText = currentLang === 'mn' ? 'English' : 'Монгол';
    }
    
    // Хэрэглэгчийн сешн шалгах
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

    // Орчуулгыг анх удаа уншуулах
    applyTranslations();
});

// Хэл солих функц
function switchLang() {
    currentLang = currentLang === 'mn' ? 'en' : 'mn';
    localStorage.setItem('iknow_lang', currentLang);
    
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.innerText = currentLang === 'mn' ? 'English' : 'Монгол';
    }
    
    applyTranslations();
}
// Хуудасны бүх текстийг сонгосон хэл рүү хөрвүүлэх функц
function applyTranslations() {
    const langData = translations[currentLang];
    if (!langData) return;

    // ID-аар нь олж текстийг солих
    const ids = [
        'feed-btn', 'myposts-btn', 'friends-btn', 'chats-btn', 'profile-btn',
        'image-btn', 'video-btn', 'post-btn', 'predictions-title',
        'bot-title', 'send-btn', 'sync-title', 'sync-status-text',
        'login-title', 'reg-title', 'login-btn-text', 'reg-btn-text',
        'toggle-reg', 'toggle-login', 'guest-btn', 'google-btn', 'exit-btn'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Түлхүүр үгийг ID-аас хамаарч зөв оноох логик
            let key = id.replace('-btn', '').replace('-title', '').replace('-text', '').replace('toggle-', 'toggleTo');
            if (id === 'feed-btn') key = 'feed';
            if (id === 'myposts-btn') key = 'myPosts';
            if (id === 'profile-btn') key = 'profileSettings';
            if (id === 'image-btn') key = 'imageBtn';
            if (id === 'video-btn') key = 'videoBtn';
            if (id === 'post-btn') key = 'postBtn';
            if (id === 'send-btn') key = 'sendBtn';
            if (id === 'exit-btn') key = 'logoutBtn';
            
            if (langData[key]) el.innerText = langData[key];
        }
    });

    // Placeholder-уудыг солих
    const futureInput = document.getElementById('future-input');
    if (futureInput && langData.futurePlaceholder) futureInput.placeholder = langData.futurePlaceholder;

    const botInput = document.getElementById('bot-input');
    if (botInput && langData.botPlaceholder) botInput.placeholder = langData.botPlaceholder;
}

// Нэвтрэх болон Бүртгүүлэх хуудас солих функц
function showAuthPage(page) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const mainApp = document.getElementById('main-app');

    if (mainApp) mainApp.style.display = 'none';

    if (page === 'login') {
        if (loginCard) loginCard.style.display = 'block';
        if (registerCard) registerCard.style.display = 'none';
    } else {
        if (loginCard) loginCard.style.display = 'none';
        if (registerCard) registerCard.style.display = 'block';
    }
}
// Шинээр бүртгэл үүсгэх функц
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
        if (!Array.isArray(usersDb)) usersDb = []; 
    } catch (err) {
        usersDb = [];
    }

    const userExists = usersDb.find(u => u.username === usernameInput);
    if (userExists) {
        alert(translations[currentLang].userExists || "Username already taken!");
        return;
    }

    const newUser = {
        username: usernameInput,
        password: passwordInput,
        predictions: [],
        syncPercentage: 0
    };
    
    usersDb.push(newUser);
    localStorage.setItem('iknow_users_db', JSON.stringify(usersDb));

    alert(translations[currentLang].regSuccess || "Registration successful! Please login.");
    showAuthPage('login');
}

// Системд нэвтрэх функц
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
        if (!Array.isArray(usersDb)) usersDb = [];
    } catch (err) {
        usersDb = [];
    }

    const matchedUser = usersDb.find(u => u.username === usernameInput && u.password === passwordInput);

    if (matchedUser) {
        currentUser = matchedUser;
        localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
        
        alert(translations[currentLang].loginSuccess || "Login successful!");
        showMainApp();
    } else {
        alert(translations[currentLang].wrongCredentials || "Wrong username or password!");
    }
}
// Google аккаунтаар нэвтрэх симуляци
function handleGoogleLogin() {
    currentUser = {
        username: "Google_User_" + Math.floor(Math.random() * 1000),
        predictions: [],
        syncPercentage: 10
    };
    localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
    alert(translations[currentLang].loginSuccess || "Login successful!");
    showMainApp();
}

// Зочин горимоор нэвтрэх
function enterAsGuest() {
    currentUser = {
        username: "Guest_" + Math.floor(Math.random() * 100),
        predictions: [],
        syncPercentage: 0
    };
    localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
    showMainApp();
}

// Амжилттай нэвтэрсний дараа үндсэн аппликейшнийг харуулах
function showMainApp() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const mainApp = document.getElementById('main-app');

    if (loginCard) loginCard.style.display = 'none';
    if (registerCard) registerCard.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';

    // Хэрэглэгчийн нэрийг профайл дээр гаргах
    const profileName = document.getElementById('profile-name');
    if (profileName && currentUser) {
        profileName.innerText = currentUser.username;
    }

    // Киборг синхрон түвшинг шинэчлэх
    updateSyncUI();
    
    // Постуудыг ачаалж дэлгэцэнд зурах
    loadPosts();
}
// Постуудыг localStorage-оос ачаалах функц
function loadPosts() {
    try {
        const rawPosts = localStorage.getItem('iknow_posts_db');
        allPosts = rawPosts ? JSON.parse(rawPosts) : [];
    } catch (e) {
        allPosts = [];
    }
    renderPosts();
}

// Зураг эсвэл видео сонгоход урьдчилж харах функц
let attachedMedia = null;
function previewMedia(type) {
    // Бодит амьдрал дээр файл сонгох цонх нээгдэнэ, энд симуляци хийв
    const mockUrl = prompt(type === 'image' ? "Enter image URL:" : "Enter video URL:");
    if (mockUrl) {
        attachedMedia = { type: type, url: mockUrl };
        alert(`${type === 'image' ? 'Image' : 'Video'} attached successfully!`);
    }
}

// Шинэ пост үүсгэх функц
function createPost() {
    const inputEl = document.getElementById('future-input');
    const text = inputEl ? inputEl.value.trim() : "";

    if (!text && !attachedMedia) return;

    // Хориотой үгс шалгах
    const hasBannedWord = bannedKeywords.some(word => text.toLowerCase().includes(word));
    if (hasBannedWord) {
        alert(translations[currentLang].bannedWordAlert || "Your post contains banned keywords!");
        return;
    }

    const newPost = {
        id: 'post_' + Date.now(),
        author: currentUser ? currentUser.username : "Anonymous",
        text: text,
        media: attachedMedia,
        timestamp: new Date().toLocaleString(),
        votes: 0,
        comments: []
    };

    allPosts.unshift(newPost);
    localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));

    // Оролтын талбаруудыг цэвэрлэх
    if (inputEl) inputEl.value = "";
    attachedMedia = null;

    renderPosts();
}
// Постуудыг HTML бүтэц рүү хөрвүүлж харуулах функц
function renderPosts() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = "";

    allPosts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post-card';
        postEl.style = "background: #1a1a1a; margin: 15px 0; padding: 15px; border-radius: 8px; border: 1px solid #333;";

        // Медиа (Зураг/Видео) хавсаргасан эсэхийг шалгах
        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') {
                mediaHtml = `<img src="${post.media.url}" style="width:100%; max-height:300px; object-fit:cover; margin-top:10px; border-radius:4px;" alt="Post Media">`;
            } else if (post.media.type === 'video') {
                mediaHtml = `<video src="${post.media.url}" controls style="width:100%; max-height:300px; margin-top:10px; border-radius:4px;"></video>`;
            }
        }

        // Сэтгэгдлийн жагсаалт үүсгэх
        let commentsHtml = "";
        post.comments.forEach(c => {
            commentsHtml += `<div style="font-size:12px; color:#aaa; margin-top:5px;"><strong>${c.author}:</strong> ${c.text}</div>`;
        });

        // Постны дотоод HTML бүтэц
        postEl.innerHTML = `
            <div style="display:flex; justify-content:between; font-size:12px; color:#888;">
                <strong>${post.author}</strong> <span>${post.timestamp}</span>
            </div>
            <p style="margin: 10px 0; color:#fff;">${post.text}</p>
            ${mediaHtml}
            <div style="margin-top:10px; display:flex; gap:15px; font-size:13px;">
                <button onclick="votePost('${post.id}')" style="background:none; border:none; color:#ffcc00; cursor:pointer;">🔮 ${translations[currentLang].verifiedFuture || "Verified Future"} (${post.votes})</button>
            </div>
            <div style="margin-top:10px; border-top:1px solid #222; padding-top:10px;">
                <div style="font-weight:bold; font-size:12px; color:#ffcc00; margin-bottom:5px;">${translations[currentLang].comments || "Comments"}:</div>
                <div id="comments-${post.id}">${commentsHtml}</div>
                <div style="display:flex; gap:5px; margin-top:5px;">
                    <input id="comment-input-${post.id}" type="text" placeholder="${translations[currentLang].writeComment || "Write a comment..."}" style="flex:1; background:#222; border:1px solid #444; color:#fff; padding:5px; font-size:12px; border-radius:4px;">
                    <button onclick="addComment('${post.id}')" style="background:#ffcc00; border:none; color:#000; padding:5px 10px; font-size:12px; border-radius:4px; cursor:pointer;">+</button>
                </div>
            </div>
        `;
        feedContainer.appendChild(postEl);
    });
}
// Постонд "Ирээдүй баталгаажсан" санал өгөх функц
function votePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        post.votes += 1;
        localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
        renderPosts();
    }
}

// Постонд сэтгэгдэл үүсгэж нэмэх функц
function addComment(postId) {
    const inputEl = document.getElementById(`comment-input-${postId}`);
    const text = inputEl ? inputEl.value.trim() : "";

    if (!text) return;

    const post = allPosts.find(p => p.id === postId);
    if (post) {
        const newComment = {
            author: currentUser ? currentUser.username : "Anonymous",
            text: text
        };
        post.comments.push(newComment);
        localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));
        
        if (inputEl) inputEl.value = "";
        renderPosts();
    }
}
// Ирээдүйн роботтой чатлах функц
function sendDirectMessage() {
    const inputEl = document.getElementById('bot-input');
    const msg = inputEl ? inputEl.value.trim() : "";

    if (!msg) return;

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Хэрэглэгчийн мессежийг чатанд нэмэх
    const userMsgEl = document.createElement('div');
    userMsgEl.style = "text-align: right; color: #ffcc00; margin: 5px 0; font-size: 14px;";
    userMsgEl.innerHTML = `<strong>You:</strong> ${msg}`;
    chatContainer.appendChild(userMsgEl);

    if (inputEl) inputEl.value = "";

    // Роботын хариу өгөх хэсэг
    setTimeout(() => {
        let botResponse = "Analyzing timeline... The future is still unwritten.";
        let matchedKeyword = null;

        // Нууц үг ашигласан эсэхийг шалгах
        for (let key in secretKeywords) {
            if (msg.toLowerCase().includes(key)) {
                matchedKeyword = key;
                break;
            }
        }

        if (matchedKeyword && currentUser) {
            // Киборг синхрон хувийг нэмэх
            currentUser.syncPercentage = Math.min(100, (currentUser.syncPercentage || 0) + secretKeywords[matchedKeyword]);
            localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
            updateSyncUI();
            botResponse = `⚡ [SECRET REVEALED] Cyborg connection stabilized! Core memory retrieved regarding: ${matchedKeyword.toUpperCase()}.`;
        } else if (msg.toLowerCase().includes("hello") || msg.toLowerCase().includes("сайн уу")) {
            botResponse = "Greetings, chrononaut. Ask me about the upcoming synthetic era.";
        }

        const botMsgEl = document.createElement('div');
        botMsgEl.style = "text-align: left; color: #aaa; margin: 5px 0; font-size: 14px;";
        botMsgEl.innerHTML = `<strong>Future Bot:</strong> ${botResponse}`;
        chatContainer.appendChild(botMsgEl);

        // Чатны цонхыг доош нь гүйлгэх
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 800);
}

// Киборг синхрон хувийг дэлгэцэнд шинэчлэх функц
function updateSyncUI() {
    const syncLevelText = document.getElementById('sync-level-text');
    const syncFill = document.getElementById('sync-fill');
    
    if (currentUser) {
        const percentage = currentUser.syncPercentage || 0;
        if (syncLevelText) syncLevelText.innerText = percentage + "%";
        if (syncFill) syncFill.style.width = percentage + "%";
    }
}

// Системээс гарах функц
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_current_user');
    showAuthPage('login');
}
