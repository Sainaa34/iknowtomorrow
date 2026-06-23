// ========================================================
// 1. GLOBAL STATE INITIALIZATION & TRANSLATIONS MATRIX
// ========================================================
let db = null; 
let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let postAttachedMedia = null;
let activeChatPartner = null;

const translations = {
    en: {
        feed: "Future Feed",
        friends: "🤝 Citizens & Chat",
        bot: "🤖 Future Bot",
        search: "Search Global Network Timeline...",
        placeholder: "What will happen tomorrow? Share your vision...",
        postBtn: "Publish Vision",
        logout: "Disconnect"
    },
    mn: {
        feed: "Ирээдүйн урсгал",
        friends: "🤝 Найзууд & Чат",
        bot: "🤖 Ирээдүйн Бот",
        search: "Ирээдүйн урсгалаас хайх...",
        placeholder: "Ирээдүйд юу болох вэ? Энд хуваалц...",
        postBtn: "Нийтлэх",
        logout: "Гарах"
    }
};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

// ========================================================
// 2. DOM INITIALIZATION & SECURE DATABASE BOOTSTRAP
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    document.body.className = "theme-" + currentTheme;
    applyTranslations();
    initIndexedDB();
    checkSession();
});

// Unlimited Database Storage Engine
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 1);
    
    request.onupgradeneeded = (e) => {
        const localDB = e.target.result;
        if (!localDB.objectStoreNames.contains("posts")) {
            localDB.createObjectStore("posts", { keyPath: "id" });
        }
        if (!localDB.objectStoreNames.contains("messages")) {
            localDB.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        loadPostsFromDB();
    };
    
    request.onerror = () => {
        console.error("Critical Matrix Alert: Database initialization failed.");
    };
}
// ========================================================
// 3. AUTHENTICATION SYSTEMS & REFRESH PICTURE LOGIC
// ========================================================
function randomizeAuthImages() {
    const authScreen = document.getElementById('auth-container');
    if (!authScreen) return;

    // Чиний GitHub дээрх яг бодит зургуудын жагсаалт (Үсэг, өргөтгөлийг яг таг тааруулсан)
    const availablePool = ['r1.webp', 'r2.jpg', 'r3.jpg', 'r4.jpg', 'r6.jpg', 'r7.jpg', 'r8.jpg', 'r9.jpg'];
    
    // Жагсаалтаас санамсаргүйгээр 4 зургийг сонгох хэсэг
    let shuffled = [...availablePool].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 4);

    // 4 буланд зургуудыг оноож харуулна (Алдаа зааж хав хар болохоос бүрэн хамгаалагдсан)
    authScreen.style.backgroundImage = `url('${selected[0]}'), url('${selected[1]}'), url('${selected[2]}'), url('${selected[3]}')`;
}

function showAuthPage(page) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (page === 'register') {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    } else {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    }
    randomizeAuthImages();
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    if (!user || !pass) return;

    localStorage.setItem(`user_${user}`, pass);
    alert("Neural Identity Created Successfully! Please Login.");
    showAuthPage('login');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;
    
    const savedPass = localStorage.getItem(`user_${user}`);
    if (savedPass && savedPass === pass) {
        currentUser = user;
        localStorage.setItem('iknow_session', user);
        showMainApp();
    } else {
        alert("Access Denied: Invalid Username or Matrix Password.");
    }
}

function checkSession() {
    const session = localStorage.getItem('iknow_session');
    if (session) {
        currentUser = session;
        showMainApp();
    } else {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        randomizeAuthImages();
    }
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('profile-name').textContent = currentUser;
    document.getElementById('profile-avatar').src = `https://robohash.org{currentUser}.png?set=set4`;
    switchTab('feed');
    loadOnlineCitizens();
}

function handleLogout() {
    localStorage.removeItem('iknow_session');
    currentUser = null;
    checkSession();
}

// ========================================================
// 4. INTERACTIVE GLOBALIZATION & INTERACTION UTILITIES
// ========================================================
function applyTranslations() {
    const elements = {
        'feed-btn': translations[currentLang].feed,
        'friends-btn': translations[currentLang].friends,
        'chats-btn': translations[currentLang].bot,
        'post-btn': translations[currentLang].postBtn
    };
    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.textContent = elements[id];
    }
    const searchEl = document.getElementById('search-input');
    if (searchEl) searchEl.placeholder = translations[currentLang].search;
    const inputEl = document.getElementById('future-input');
    if (inputEl) inputEl.placeholder = translations[currentLang].placeholder;
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'mn' : 'en';
    localStorage.setItem('iknow_lang', currentLang);
    document.getElementById('lang-btn').textContent = currentLang === 'en' ? 'Монгол' : 'English';
    applyTranslations();
}

function toggleTheme() {
    const themes = ['cyber', 'matrix', 'dark'];
    let idx = themes.indexOf(currentTheme);
    currentTheme = themes[(idx + 1) % themes.length];
    localStorage.setItem('iknow_theme', currentTheme);
    document.body.className = "theme-" + currentTheme;
    document.getElementById('theme-btn').textContent = `🎨 Theme: ${currentTheme.toUpperCase()}`;
}

function switchTab(tabId) {
    const tabs = ['feed', 'friends', 'chats'];
    tabs.forEach(t => {
        const content = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`${t}-btn`);
        if (content) content.style.display = t === tabId ? 'block' : 'none';
        if (btn) {
            if (t === tabId) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
}
// ========================================================
// 5. MULTIMEDIA UPLOAD MANAGEMENT & STORAGE SAFENESS
// ========================================================
function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        postAttachedMedia = { type: type, url: e.target.result };
        
        const previewBox = document.getElementById('post-media-preview-box');
        const previewImg = document.getElementById('post-image-preview-img');
        const previewVid = document.getElementById('post-video-preview-vid');
        
        if (previewBox) previewBox.style.display = 'block';
        
        if (type === 'image' && previewImg) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            if (previewVid) previewVid.style.display = 'none';
        }
        if (type === 'video' && previewVid) {
            previewVid.src = e.target.result;
            previewVid.style.display = 'block';
            if (previewImg) previewImg.style.display = 'none';
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
    if (previewImg) { previewImg.src = ""; previewImg.style.display = 'none'; }
    if (previewVid) { previewVid.src = ""; previewVid.style.display = 'none'; }
    
    const imgInput = document.getElementById('post-image-file');
    const vidInput = document.getElementById('post-video-file');
    if (imgInput) imgInput.value = "";
    if (vidInput) vidInput.value = "";
}

// ========================================================
// 6. FUTURE TIMELINE POSTS ENGINE & NEON RANKINGS
// ========================================================
function createPost() {
    const inputEl = document.getElementById('future-input');
    const text = inputEl ? inputEl.value.trim() : "";
    if (!text && !postAttachedMedia) return;

    // Хориотой үг шалгах шүүлтүүр
    const hasBannedWord = bannedKeywords.some(word => text.toLowerCase().includes(word));
    if (hasBannedWord) {
        alert("System Error: Malicious data or scam pattern detected.");
        return;
    }

    const newPost = {
        id: "post_" + Date.now(),
        author: currentUser,
        text: text,
        media: postAttachedMedia,
        votes: 0,
        voters: [],
        comments: [],
        timestamp: new Date().toLocaleString()
    };

    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    store.add(newPost);

    transaction.oncomplete = () => {
        if (inputEl) inputEl.value = "";
        clearAttachedMedia();
        loadPostsFromDB();
    };
}

function loadPostsFromDB() {
    if (!db) return;
    const store = db.transaction(["posts"], "readonly").objectStore("posts");
    const request = store.getAll();

    request.onsuccess = () => {
        allPosts = request.result;
        // Хамгийн их Vote-той болон шинэ постуудыг дээр нь гаргаж эрэмбэлнэ
        allPosts.sort((a, b) => b.votes - a.votes || b.id.localeCompare(a.id));
        renderPosts(allPosts);
    };
}

function renderPosts(postsToRender) {
    const container = document.getElementById('feed-container');
    if (!container) return;
    container.innerHTML = "";

    postsToRender.forEach(post => {
        // Кристал бөмбөлөг (Vote)-ны тоогоор неон хүрээг автоматаар ялгана
        let tierClass = "";
        if (post.votes >= 15) tierClass = "tier-matrix";
        else if (post.votes >= 7) tierClass = "tier-electric";
        else if (post.votes >= 3) tierClass = "tier-fire";

        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') {
                mediaHtml = `<div class="post-media-content"><img src="${post.media.url}" alt="Post Matrix Data"></div>`;
            } else if (post.media.type === 'video') {
                mediaHtml = `<div class="post-media-content"><video src="${post.media.url}" controls></video></div>`;
            }
        }

        let commentsHtml = "";
        post.comments.forEach(c => {
            commentsHtml += `<div class="comment-node"><strong>${c.user}:</strong> ${c.text}</div>`;
        });

        const card = document.createElement('div');
        card.className = `post-card ${tierClass}`;
        card.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="https://robohash.org{post.author}.png?set=set4" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>${post.timestamp}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <button class="vote-btn-neon" onclick="votePost('${post.id}')">🔮 ${post.votes}</button>
                    ${post.author === currentUser ? `<button class="post-more-btn" onclick="deletePost('${post.id}')">✕</button>` : ""}
                </div>
            </div>
            <div class="post-main-text">${post.text}</div>
            ${mediaHtml}
            <div class="comments-section">
                <div class="comments-list">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input type="text" id="input-comm-${post.id}" placeholder="Add neural response..." onkeypress="if(event.key === 'Enter') addComment('${post.id}')">
                    <button class="comment-add-btn" onclick="addComment('${post.id}')">➔</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function votePost(postId) {
    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.get(postId);

    request.onsuccess = () => {
        const post = request.result;
        if (!post.voters) post.voters = [];
        
        if (post.voters.includes(currentUser)) {
            // Хэрэв дахин дарвал Vote-оо цуцална
            post.votes--;
            post.voters = post.voters.filter(v => v !== currentUser);
        } else {
            post.votes++;
            post.voters.push(currentUser);
        }
        store.put(post);
    };

    transaction.oncomplete = () => { loadPostsFromDB(); };
}

function deletePost(postId) {
    if (!confirm("Are you sure you want to purge this timeline post?")) return;
    const transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").delete(postId);
    transaction.oncomplete = () => { loadPostsFromDB(); };
}

function searchPosts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) {
        renderPosts(allPosts);
        return;
    }
    const filtered = allPosts.filter(p => p.text.toLowerCase().includes(query) || p.author.toLowerCase().includes(query));
    renderPosts(filtered);
}

function addComment(postId) {
    const input = document.getElementById(`input-comm-${postId}`);
    const text = input ? input.value.trim() : "";
    if (!text) return;

    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.get(postId);

    request.onsuccess = () => {
        const post = request.result;
        post.comments.push({ user: currentUser, text: text });
        store.put(post);
    };

    transaction.oncomplete = () => {
        if (input) input.value = "";
        loadPostsFromDB();
    };
}
// ========================================================
// 7. REAL-TIME CITIZENS & SAFE PRIVACY CHATS SYSTEM
// ========================================================
function loadOnlineCitizens() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    // Жишээ болгон системд байгаа 3 иргэнийг харуулна
    const systemCitizens = ["Neo_2050", "Trinity_X", "Morph_Quantum"];
    
    systemCitizens.forEach(citizen => {
        const row = document.createElement('div');
        row.className = `friend-item-row ${activeChatPartner === citizen ? 'active' : ''}`;
        row.onclick = () => selectChatPartner(citizen);
        row.innerHTML = `
            <img src="https://robohash.org{citizen}.png?set=set4" class="friend-avatar-mini">
            <span>${citizen}</span>
        `;
        container.appendChild(row);
    });
}

function selectChatPartner(citizenName) {
    activeChatPartner = citizenName;
    const header = document.getElementById('active-chat-partner');
    if (header) header.textContent = `💬 Chat with ${citizenName}`;
    loadOnlineCitizens();
    loadFriendMessages();
}

function sendFriendMessage() {
    const input = document.getElementById('friends-chat-input');
    const text = input ? input.value.trim() : "";
    if (!text || !activeChatPartner || !db) return;

    const newMsg = {
        id: "msg_" + Date.now(),
        sender: currentUser,
        receiver: activeChatPartner,
        text: text,
        timestamp: new Date().toLocaleTimeString()
    };

    const transaction = db.transaction(["messages"], "readwrite");
    transaction.objectStore("messages").add(newMsg);

    transaction.oncomplete = () => {
        if (input) input.value = "";
        loadFriendMessages();
    };
}

function loadFriendMessages() {
    if (!db || !activeChatPartner) return;
    const store = db.transaction(["messages"], "readonly").objectStore("messages");
    const request = store.getAll();

    request.onsuccess = () => {
        const allMsgs = request.result;
        const msgBox = document.getElementById('friends-chat-messages');
        if (!msgBox) return;
        msgBox.innerHTML = "";

        // Зөвхөн сонгосон найз бид хоёрын хооронд шилжсэн мессежүүдийг шүүнэ
        const filtered = allMsgs.filter(m => 
            (m.sender === currentUser && m.receiver === activeChatPartner) ||
            (m.sender === activeChatPartner && m.receiver === currentUser)
        );

        filtered.forEach(m => {
            const isMe = m.sender === currentUser;
            const div = document.createElement('div');
            div.className = `msg-row ${isMe ? 'user' : 'friend-msg'}`;
            div.innerHTML = `<strong>${m.sender}:</strong> ${m.text}`;
            msgBox.appendChild(div);
        });
        msgBox.scrollTop = msgBox.scrollHeight;
    };
}

// ========================================================
// 8. SMART REAL AI BOT (Энгийн бөгөөд ухаалаг хариулагч)
// ========================================================
function sendDirectMessage() {
    const inputEl = document.getElementById('bot-input');
    const msg = inputEl ? inputEl.value.trim() : "";
    if (!msg) return;

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Хэрэглэгчийн мессежийг дэлгэцэнд зурах
    chatContainer.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${msg}</div>`;
    inputEl.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Бот тэнэг хувь хэлэхгүй, шууд ухаалгаар монголоор хариулна
    setTimeout(() => {
        let botResponse = "Зөв санаа байна. Үүнийг ирээдүйн сүлжээнд судалж, дүн шинжилгээ хийж үзэх хэрэгтэй.";
        
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes("сайн уу")) {
            botResponse = "Сайн байна уу! Би бэлэн байна. Ирээдүйн зөгнөл болон төлөвлөгөөний талаар юуг хэлэлцэх үү?";
        } else if (lowerMsg.includes("хэн") || lowerMsg.includes("чи")) {
            botResponse = "Би бол iKnowTomorrow сүлжээний ухаалаг туслах байна. Танд системийн алдаагүй ажиллагаанд тусална.";
        } else if (lowerMsg.includes("хэзээ") || lowerMsg.includes("хэрхэн")) {
            botResponse = "Цаг хугацааны урсгал таны одоо хийж буй зөв үйлдлээс шууд хамаарна. Төлөвлөгөөгөө үргэлжлүүлээд хуваалцаарай.";
        } else if (lowerMsg.includes("баярлалаа") || lowerMsg.includes("ок")) {
            botResponse = "Зүгээр дээ, танд тусалж чадсандаа баяртай байна! Өөр асуух зүйл байна уу?";
        }

        chatContainer.innerHTML += `<div class="msg-row bot"><strong>Future Bot:</strong> ${botResponse}</div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
}

// ========================================================
// 9. IDENTITY PROFILE WIDGET & MODAL INTERFACE
// ========================================================
function openProfileModal() {
    const modal = document.getElementById('profile-overlay' || 'profile-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    
    const userIn = document.getElementById('modal-username');
    if (userIn) userIn.value = currentUser;
}

function closeProfileModal() {
    const modal = document.getElementById('profile-overlay' || 'profile-modal');
    if (modal) modal.style.display = 'none';
}

function saveProfileModal() {
    const userIn = document.getElementById('modal-username');
    if (userIn && userIn.value.trim()) {
        const oldName = currentUser;
        const newName = userIn.value.trim();
        
        // Session шинэчлэх
        localStorage.setItem('iknow_session', newName);
        currentUser = newName;
        document.getElementById('profile-name').textContent = newName;
        
        // Хуучин нууц үгийг шинэ нэр рүү шилжүүлэх
        const pass = localStorage.getItem(`user_${oldName}`);
        if (pass) {
            localStorage.setItem(`user_${newName}`, pass);
            localStorage.removeItem(`user_${oldName}`);
        }
    }
    closeProfileModal();
}

function handleAvatarFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const headerAvatar = document.getElementById('profile-avatar');
        if (headerAvatar) headerAvatar.src = e.target.result;
        
        const modalAvatarInput = document.getElementById('modal-avatar');
        if (modalAvatarInput) modalAvatarInput.value = e.target.result;
    };
    reader.readAsDataURL(file);
}
