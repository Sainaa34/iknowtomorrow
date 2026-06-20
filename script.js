// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let currentTab = 'feed';
let selectedFriend = null;

// Translations Database (Batalgaajsan ireedui -> Ирээдүй биелсэн болгов)
const translations = {
    en: {
        feed: "Feed",
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
        feed: "Тэжээл",
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

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Темыг идэвхжүүлэх
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

// ТЕМЕ СОЛИХ СИСТЕМ (Cyber -> Matrix -> Dark)
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
        avatar: "https://robohash.org" + encodeURIComponent(usernameInput) + ".png?set=set4"
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
        avatar: "https://robohash.orgguest.png?set=set4"
    };
    // Зочин бүртгэл тул сешнд түр хадгална, үндсэн хэрэглэгчдийн баазыг бохирдуулахгүй
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

// 📎 ПОСТОНД КОМПЬЮТЕРЭЭС ФАЙЛ СОНГОЖ ОРУУЛАХ ФУНКЦ
let postAttachedMedia = null;
function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        postAttachedMedia = { type: type, url: e.target.result };
        const statusEl = document.getElementById('file-attached-status');
        if (statusEl) statusEl.innerText = `📎 ${type === 'image' ? 'Image' : 'Video'} loaded!`;
    };
    reader.readAsDataURL(file);
}

function loadPosts() {
    try {
        const rawPosts = localStorage.getItem('iknow_posts_db');
        allPosts = rawPosts ? JSON.parse(rawPosts) : [];
    } catch (e) { allPosts = []; }
    renderPosts();
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

    // 🕒 Цаг хугацааны тамгыг Огноо, Цаг, Минут, Секундтэй хамт үүсгэх
    const now = new Date();
    const timestampStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    const newPost = {
        id: 'post_' + Date.now(),
        author: currentUser ? currentUser.username : "Anonymous",
        authorAvatar: currentUser ? currentUser.avatar : "https://robohash.org",
        text: text,
        media: postAttachedMedia,
        timestamp: timestampStr, // Сүүлийн скриншот дээр гацаад байсан цагийг энд орууллаа
        votes: 0,
        comments: []
    };

    allPosts.unshift(newPost);
    localStorage.setItem('iknow_posts_db', JSON.stringify(allPosts));

    // Оролтын талбаруудыг цэвэрлэх
    if (inputEl) inputEl.value = "";
    postAttachedMedia = null;
    const statusEl = document.getElementById('file-attached-status');
    if (statusEl) statusEl.innerText = "";

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

    let filteredPosts = allPosts.filter(post => 
        post.text.toLowerCase().includes(searchVal) || 
        post.author.toLowerCase().includes(searchVal)
    );

    // 🚀 TRENDING СИСТЕМ: Хамгийн их санал авсан нь дээрээ гарна
    filteredPosts.sort((a, b) => b.votes - a.votes);

    filteredPosts.forEach(post => {
        const postEl = document.createElement('div');
        
        // 🔥 ЧИНИЙ ХҮССЭН 3 ШАТЛАЛТ ГАЛ, ЦАХИЛГААНЫ АНИМАЦИ АШИГЛАХ АНГИЛАЛ
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

        // 📌 БАРУУН БУЛАНД ЖИЖИГХЭН САНАЛ ӨГӨХ БҮТЭЦ
        postEl.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="${avatarUrl}" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>📅 ${post.timestamp}</span>
                    </div>
                </div>
                <div>
                    <!-- Баталгаажсан ирээдүй биш "Ирээдүй биелсэн" болгон өөрчлөв -->
                    <button onclick="votePost('${post.id}')" class="vote-btn-neon">🔮 ${translations[currentLang].verifiedFuture || "Ирээдүй биелсэн"} (${post.votes})</button>
                </div>
            </div>
            <p class="post-main-text">${post.text}</p>
            ${mediaHtml}
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

// 🤝 ХЭРЭГЛЭГЧИД ХООРОНДОО НАЙЗ БОЛОХ БА ЧАТЛАХ СИСТЕМ
function loadFriendsList() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    let usersDb = [];
    try {
        const rawData = localStorage.getItem('iknow_users_db');
        usersDb = rawData ? JSON.parse(rawData) : [];
    } catch (e) { usersDb = []; }

    // Өөрөөсөө бусад бүх бүртгэлтэй иргэдийг харуулна
    const onlineFriends = usersDb.filter(u => u.username.toLowerCase() !== currentUser.username.toLowerCase());

    if (onlineFriends.length === 0) {
        container.innerHTML = `<div style="font-size:12px; color:var(--text-gray); padding:10px;">No other citizens online.</div>`;
        return;
    }

    onlineFriends.forEach(user => {
        const row = document.createElement('div');
        row.className = "friend-item-row" + (selectedFriend === user.username ? " active" : "");
        row.onclick = () => selectFriendToChat(user.username);
        
        row.innerHTML = `
            <img src="${user.avatar || 'https://robohash.org'}" class="friend-avatar-mini">
            <span>${user.username}</span>
        `;
        container.appendChild(row);
    });
}

function selectFriendToChat(friendName) {
    selectedFriend = friendName;
    const header = document.getElementById('active-chat-partner');
    if (header) header.innerText = `💬 Chatting with: ${friendName}`;
    
    loadFriendsList(); // Жагсаалтыг идэвхтэй төлөвтэйгээр шинэчлэх
    renderFriendMessages();
}

function renderFriendMessages() {
    const box = document.getElementById('friends-chat-messages');
    if (!box || !selectedFriend) return;
    box.innerHTML = "";

    let chatKey = [currentUser.username, selectedFriend].sort().join("_chat_");
    let messages = [];
    try {
        const rawMsgs = localStorage.getItem(chatKey);
        messages = rawMsgs ? JSON.parse(rawMsgs) : [];
    } catch (e) { messages = []; }

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
    let messages = [];
    try {
        const rawMsgs = localStorage.getItem(chatKey);
        messages = rawMsgs ? JSON.parse(rawMsgs) : [];
    } catch (e) { messages = []; }

    messages.push({ sender: currentUser.username, text: text });
    localStorage.setItem(chatKey, JSON.stringify(messages));
    
    if (inputEl) inputEl.value = "";
    renderFriendMessages();
}

// 🤖 ЖИНХЭНЭ УХААЛАГ AI БОТ СИСТЕМ (Над шиг ухаантай, дурын сэдвээр чөлөөтэй харилцана)
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
        // HuggingFace ухаалаг AI модельтай шууд холбогдох
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                inputs: `<|system|>\nYou are Future Bot, an extremely smart AI guide on the social site iKnowTomorrow. Speak naturally like ChatGPT. Respond instantly and deeply to any question. If user speaks Mongolian, reply in Mongolian. If English, reply in English.\n<|user|>\n${msg}\n<|assistant|>\n`,
                parameters: { max_new_tokens: 200, temperature: 0.7 }
            })
        });

        const data = await response.json();
        let aiReply = "";

        if (data && data.generated_text) {
            const parts = data.generated_text.split("<|assistant|>\n");
            aiReply = parts[parts.length - 1] || data.generated_text;
        } else if (Array.isArray(data) && data[0]?.generated_text) {
            const parts = data[0].generated_text.split("<|assistant|>\n");
            aiReply = parts[parts.length - 1] || data[0].generated_text;
        } else {
            aiReply = "Quantum signals are fluctuating. Please repeat your prophecy.";
        }

        botRow.innerHTML = `<strong>Future Bot:</strong> ${aiReply.trim()}`;
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        botRow.innerHTML = `<strong>Future Bot:</strong> [Matrix Safe Mode] Сүлжээ түр тасарлаа. Ирээдүй маш хурдтай хувьсаж байна. Дахин асууна уу.`;
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_current_user');
    showAuthPage('login');
}

function toggleLanguage() { 
    switchLang(); 
}
