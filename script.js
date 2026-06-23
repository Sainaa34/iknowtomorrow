// ========================================================
// 1. GLOBAL STATE INITIALIZATION & TRANSLATION CONSTANTS
// ========================================================
let db = null; 
let currentTheme = localStorage.getItem('iknow_theme') || 'light'; 
let currentUser = null;
let allPosts = [];
let postAttachedMedia = null;
let activeChatPartner = null;

// Календарь болон профайл зураг түр хадгалах хувьсагчид
let vaultSelectedImageBase64 = null;
let modalSelectedAvatarBase64 = null;

// Блок жагсаалт болон уншаагүй чатны тэмдэглэгээ
let blockedUsers = JSON.parse(localStorage.getItem('iknow_blocked_users')) || {};
let unseenMessagesFrom = JSON.parse(localStorage.getItem('iknow_unseen_msgs')) || {};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

document.addEventListener('DOMContentLoaded', () => {
    document.body.className = "theme-" + currentTheme;
    
    // 🌐 HOME LOGO RESET ACTION BOUNDING
    const logoElement = document.querySelector('.logo-neon');
    if (logoElement) {
        logoElement.style.cursor = 'pointer';
        logoElement.addEventListener('click', resetAppToHome);
    }

    initIndexedDB();
    checkSession(); // F5 refresh-ийг гацаахгүйгээр сессийг шууд түгжинэ
});

// Unlimited Database Storage Connection Matrix
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 5); // v5 хувилбар
    
    request.onupgradeneeded = (e) => {
        const localDB = e.target.result;
        if (!localDB.objectStoreNames.contains("posts")) {
            localDB.createObjectStore("posts", { keyPath: "id" });
        }
        if (!localDB.objectStoreNames.contains("messages")) {
            localDB.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        }
        if (!localDB.objectStoreNames.contains("vault_calendar")) {
            localDB.createObjectStore("vault_calendar", { keyPath: "id" });
        }
        if (!localDB.objectStoreNames.contains("vault_notes")) {
            localDB.createObjectStore("vault_notes", { keyPath: "id" });
        }
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        loadPostsFromDB();
        loadVaultCalendarFromDB();
    };
}
// ========================================================
// 2. IDENTITY BACKDROP MANAGEMENT & AUTHENTICATION INFRA
// ========================================================
function randomizeAuthImages() {
    // index.html дээр арын зургийг CSS-ээр шууд уншуулдаг болсон тул энд ачаалал өгөхгүй цэвэр үлдээв
}

function showAuthPage(page) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (page === 'register') {
        if (loginCard) loginCard.style.display = 'none';
        if (registerCard) registerCard.style.display = 'block';
    } else {
        if (loginCard) loginCard.style.display = 'block';
        if (registerCard) registerCard.style.display = 'none';
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

// ========================================================
// 3. SECURE AUTHENTICATION MATRIX (1-CLICK & CLEAN DISCONNECT)
// ========================================================
function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    if (!user || !pass) return;

    localStorage.setItem(`user_${user}`, pass);
    localStorage.setItem(`avatar_${user}`, "avatar.png"); // Автоматаар үндсэн avatar.png-ийг онооно

    alert("Neural Identity Created Successfully!");
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
        
        // 🔄 ИНПУТ ЦЭВЭРЛЭГЭЭ: Нэвтэрмэгц талбаруудыг шууд хоосон болгоно
        document.getElementById('login-username').value = "";
        document.getElementById('login-password').value = "";
        
        showMainApp();
    } else {
        alert("Access Denied: Invalid Username or Password.");
    }
}

// Google Neural Gateway - Google-ээр шууд нэвтрэх урсгал
function handleGoogleAuth() {
    const googleUser = "Google_Citizen_" + Math.floor(1000 + Math.random() * 9000);
    currentUser = googleUser;
    localStorage.setItem('iknow_session', googleUser);
    if (!localStorage.getItem(`avatar_${googleUser}`)) {
        localStorage.setItem(`avatar_${googleUser}`, "avatar.png");
    }
    alert("Authenticated via Google Neural Gateway network node!");
    showMainApp();
}

function checkSession() {
    const session = localStorage.getItem('iknow_session');
    if (session) {
        currentUser = session;
        // F5 дарахад хуудас гацаж гарахаас сэргийлж, бүтцийг шууд амилуулна
        if (document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'none';
        if (document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
        showMainApp();
    } else {
        if (document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'flex';
        if (document.getElementById('main-app')) document.getElementById('main-app').style.display = 'none';
    }
}

function showMainApp() {
    if (document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'none';
    if (document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
    
    document.getElementById('profile-name').textContent = currentUser;
    
    const storedAvatar = localStorage.getItem(`avatar_${currentUser}`);
    document.getElementById('profile-avatar').src = storedAvatar || "avatar.png";
    
    switchTab('feed');
    loadOnlineCitizens();
    if (db) {
        loadPostsFromDB();
        loadVaultCalendarFromDB();
    }
}

function handleLogout() {
    localStorage.removeItem('iknow_session');
    currentUser = null;
    activeChatPartner = null;

    // 🔒 НЭР НУУЦ ҮГИЙГ БҮРМӨСӨН АРЧИЖ ЦЭВЭРЛЭХ ХЭСЭГ
    const inputIds = ['login-username', 'login-password', 'reg-username', 'reg-password'];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    checkSession();
}
// ========================================================
// 4. INTERACTIVE UTILITIES & CORE NAVIGATION
// ========================================================
function toggleTheme() {
    const themes = ['light', 'cyber', 'matrix', 'dark'];
    let idx = themes.indexOf(currentTheme);
    currentTheme = themes[(idx + 1) % themes.length];
    localStorage.setItem('iknow_theme', currentTheme);
    document.body.className = "theme-" + currentTheme;
    document.getElementById('theme-btn').textContent = `🎨 Theme: ${currentTheme.toUpperCase()}`;
}

function switchTab(tabId) {
    const tabs = ['feed', 'friends', 'vault', 'chats'];
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

// 🌐 Үндсэн сайт руу буцах үед бүх зүйлийг анхны байдалд нь оруулж эхлүүлнэ
function resetAppToHome() {
    const searchBox = document.getElementById('search-input');
    const feedArea = document.getElementById('future-input');
    if (searchBox) searchBox.value = "";
    if (feedArea) feedArea.value = "";
    switchTab('feed');
    loadPostsFromDB();
}

// ========================================================
// 5. TIMELINE MULTIMEDIA CAPTURE INTERFACES
// ========================================================
function handleFileSelect(event, type) {
    const file = event.target.files;
    if (!file || file.length === 0) return;

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
    reader.readAsDataURL(file[0]); // Индексийг яг таг баталгаажуулав
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
// 6. MASTER TIMELINE ENGINE & VERIFIED CRYSTAL SYSTEM
// ========================================================
function createPost() {
    const inputEl = document.getElementById('future-input');
    const text = inputEl ? inputEl.value.trim() : "";
    if (!text && !postAttachedMedia) return;

    if (bannedKeywords.some(word => text.toLowerCase().includes(word))) {
        alert("System Error: Blocked signature vector pattern.");
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
        timestamp: Date.now() // "Just now"-ыг зөв тооцоолох суурь огноо
    };

    const transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").add(newPost);

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

        // 🧠 ОН ЦАГИЙН ДАРААЛАЛ: Өөрийн пост дээрээ, он цагаар хамгийн шинэ нь хамгийн дээрээ харагдана
        allPosts.sort((a, b) => {
            const isMeA = a.author === currentUser ? 1 : 0;
            const isMeB = b.author === currentUser ? 1 : 0;
            if (isMeA !== isMeB) return isMeB - isMeA;
            return b.timestamp - a.timestamp;
        });
        renderPosts(allPosts);
    };
}

function renderPosts(postsToRender) {
    const container = document.getElementById('feed-container');
    if (!container) return;
    container.innerHTML = "";

    postsToRender.forEach(post => {
        if (!post.voters) post.voters = [];
        const hasVerified = post.voters.includes(currentUser);

        // ⏱️ Постын хугацаа тооцоологч ("Just now" эффект)
        let timeDisplay = "Just now";
        const diffSec = Math.floor((Date.now() - post.timestamp) / 1000);
        if (diffSec > 59) {
            timeDisplay = new Date(post.timestamp).toLocaleString();
        }

        // 🖼️ Хуучин постуудын аватар солигдохгүй байхыг зассан хэсэг (Локал санах ойноос шууд уншина)
        const currentPostUserAvatar = localStorage.getItem(`avatar_${post.author}`) || "avatar.png";

        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') {
                mediaHtml = `<div class="post-media-content"><img src="${post.media.url}"></div>`;
            } else if (post.media.type === 'video') {
                mediaHtml = `<div class="post-media-content"><video src="${post.media.url}" controls></video></div>`;
            }
        }

        let commentsHtml = "";
        if (post.comments) {
            post.comments.forEach((c, idx) => {
                if (!c.voters) c.voters = [];
                const hasCommentLiked = c.voters.includes(currentUser);
                
                let commentTimeDisplay = "Just now";
                if (c.timestamp) {
                    const cDiff = Math.floor((Date.now() - c.timestamp) / 1000);
                    if (cDiff > 59) commentTimeDisplay = new Date(c.timestamp).toLocaleTimeString();
                }

                const currentCommentUserAvatar = localStorage.getItem(`avatar_${c.user}`) || "avatar.png";

                commentsHtml += `
                    <div class="comment-node">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                            <img src="${currentCommentUserAvatar}" style="width:20px; height:20px; border-radius:50%; object-fit:cover;">
                            <strong>${c.user}:</strong>
                        </div>
                        <div>${c.text}</div>
                        <div class="comment-meta-row">
                            <span class="comment-time">${commentTimeDisplay}</span>
                            <button class="comment-vote-btn ${hasCommentLiked ? 'liked' : ''}" onclick="voteComment('${post.id}', ${idx})">
                                🔮 ${c.votes || 0}
                            </button>
                        </div>
                    </div>`;
            });
        }

        const card = document.createElement('div');
        card.className = "post-card";
        card.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="${currentPostUserAvatar}" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>${timeDisplay}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <button class="vote-btn-neon ${hasVerified ? 'liked' : ''}" onclick="votePost('${post.id}')">
                        🔮 Prophecy Verified ${post.votes}
                    </button>
                    ${post.author === currentUser ? `<button class="post-more-btn" onclick="deletePost('${post.id}')">✕</button>` : ""}
                </div>
            </div>
            <div class="post-main-text">${post.text}</div>
            ${mediaHtml}
            <div class="comments-section">
                <div class="comments-list">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input type="text" class="neural-comment-input-tag" id="input-comm-${post.id}" data-post-id="${post.id}" placeholder="Write a response and press Enter...">
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
// ========================================================
// 6.2 POST & COMMENT TEXT INTERFACE EVENT BINDINGS
// ========================================================
document.addEventListener('keydown', (e) => {
    // Постын талбарт Enter дарахад нийтлэх (Shift+Enter шинэ мөр авна)
    if (e.target && e.target.id === 'future-input') {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createPost();
        }
    }
    // Сэтгэгдэл (Comment) бичих талбарт Enter дарахад шууд илгээнэ
    if (e.target && e.target.className === 'neural-comment-input-tag') {
        if (e.key === 'Enter') {
            e.preventDefault();
            const postId = e.target.getAttribute('data-post-id');
            addComment(postId);
        }
    }
});

function addComment(postId) {
    const input = document.getElementById(`input-comm-${postId}`);
    const text = input ? input.value.trim() : "";
    if (!text) return;

    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.get(postId);

    request.onsuccess = () => {
        const post = request.result;
        if (!post.comments) post.comments = [];
        
        // Сэтгэгдлийг цаг хугацаа болон кристал өгөгдөлтэй хадгална
        post.comments.push({
            user: currentUser,
            text: text,
            timestamp: Date.now(),
            votes: 0,
            voters: []
        });
        store.put(post);
    };

    transaction.oncomplete = () => {
        if (input) input.value = "";
        loadPostsFromDB();
    };
}

function voteComment(postId, commentIdx) {
    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.get(postId);

    request.onsuccess = () => {
        const post = request.result;
        const comment = post.comments[commentIdx];
        if (!comment.voters) comment.voters = [];
        if (!comment.votes) comment.votes = 0;

        if (comment.voters.includes(currentUser)) {
            comment.votes--;
            comment.voters = comment.voters.filter(v => v !== currentUser);
        } else {
            comment.votes++;
            comment.voters.push(currentUser);
        }
        store.put(post);
    };
    transaction.oncomplete = () => { loadPostsFromDB(); };
}
function deletePost(postId) {
    if (!confirm("Purge post from matrix timeline?")) return;
    const transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").delete(postId);
    transaction.oncomplete = () => { loadPostsFromDB(); };
}

// ========================================================
// 6.3 PATChED SEARCH PROCESSOR (Preserves Comments Context)
// ========================================================
function searchPosts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) { 
        renderPosts(allPosts); 
        return; 
    }
    
    // 🧠 УХААЛАГ ХАЙЛТ: Сэтгэгдлийг хасахгүйгээр постын доторх өгөгдлийг зөв шүүнэ
    const filtered = allPosts.filter(p => {
        const textMatch = p.text.toLowerCase().includes(query);
        const authorMatch = p.author.toLowerCase().includes(query);
        const commentMatch = p.comments && p.comments.some(c => c.text.toLowerCase().includes(query));
        return textMatch || authorMatch || commentMatch;
    });
    renderPosts(filtered);
}
// ========================================================
// 7. REAL-TIME CITIZENS MESSENGER (Facebook Style UI Logic)
// ========================================================
function loadOnlineCitizens() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    let systemCitizens = ["Neo_2050", "Trinity_X", "Morph_Quantum"];
    if (!blockedUsers) blockedUsers = {};
    if (!unseenMessagesFrom) unseenMessagesFrom = {};
    
    // 🧠 УХААЛАГ ЭРЭМБЭЛЭЛТ: Шинэ мессежтэй хүмүүс үргэлж хамгийн эхэнд гарна
    systemCitizens.sort((a, b) => {
        const hasUnseenA = unseenMessagesFrom[a] ? 1 : 0;
        const hasUnseenB = unseenMessagesFrom[b] ? 1 : 0;
        if (hasUnseenA !== hasUnseenB) return hasUnseenB - hasUnseenA;
        return a.localeCompare(b);
    });

    systemCitizens.forEach(citizen => {
        if (citizen === currentUser) return;

        const isBlocked = blockedUsers[citizen] ? true : false;
        const hasUnseen = unseenMessagesFrom[citizen] ? true : false;

        const row = document.createElement('div');
        row.className = `friend-item-row ${activeChatPartner === citizen ? 'active' : ''}`;
        
        row.innerHTML = `
            <div class="friend-user-meta-block" style="flex:1;" onclick="selectChatPartner('${citizen}')">
                ${hasUnseen ? `<span class="unseen-mark">!!!</span>` : ""}
                <img src="${localStorage.getItem(`avatar_${citizen}`) || "avatar.png"}" class="friend-avatar-mini">
                <span style="font-weight: ${hasUnseen ? 'bold' : 'normal'};">${citizen} ${isBlocked ? '(Blocked)' : ''}</span>
            </div>
            <button class="friend-block-btn ${isBlocked ? 'blocked' : ''}" onclick="toggleBlockUser(event, '${citizen}')">
                ${isBlocked ? 'Unblock' : 'Block'}
            </button>
        `;
        container.appendChild(row);
    });
}

function toggleBlockUser(event, citizenName) {
    event.stopPropagation();
    if (!blockedUsers) blockedUsers = {};
    
    if (blockedUsers[citizenName]) {
        delete blockedUsers[citizenName];
        alert(`${citizenName} has been unblocked.`);
    } else {
        blockedUsers[citizenName] = true;
        alert(`${citizenName} has been blocked.`);
        if (activeChatPartner === citizenName) {
            activeChatPartner = null;
            document.getElementById('active-chat-partner').textContent = "💬 Select a neural citizen to initiate chat";
            document.getElementById('friends-chat-messages').innerHTML = "";
        }
    }
    localStorage.setItem('iknow_blocked_users', JSON.stringify(blockedUsers));
    loadOnlineCitizens();
}

function selectChatPartner(citizenName) {
    if (blockedUsers && blockedUsers[citizenName]) {
        alert("This entity is blocked. Unblock them first.");
        return;
    }
    activeChatPartner = citizenName;
    if (unseenMessagesFrom && unseenMessagesFrom[citizenName]) {
        delete unseenMessagesFrom[citizenName];
        localStorage.setItem('iknow_unseen_msgs', JSON.stringify(unseenMessagesFrom));
    }
    const header = document.getElementById('active-chat-partner');
    if (header) header.textContent = `💬 Chat with ${citizenName}`;
    loadOnlineCitizens();
    loadFriendMessages();
}

function sendFriendMessage() {
    const input = document.getElementById('friends-chat-input');
    const text = input ? input.value.trim() : "";
    if (!text || !activeChatPartner || !db) return;

    if (blockedUsers && blockedUsers[activeChatPartner]) {
        alert("Action Aborted: Blocked entity.");
        return;
    }

    const newMsg = {
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
        loadOnlineCitizens();
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
// 8. 🔒 MASTER CALENDAR VAULT (Strict Multi-User Privacy)
// ========================================================
function handleVaultImageSelect(event) {
    const file = event.target.files;
    if (!file || file.length === 0) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        vaultSelectedImageBase64 = e.target.result;
        const previewBox = document.getElementById('vault-image-preview-box');
        const previewImg = document.getElementById('vault-img-preview-tag');
        if (previewBox && previewImg) {
            previewImg.src = e.target.result;
            previewBox.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

function clearVaultImageSelect() {
    vaultSelectedImageBase64 = null;
    const previewBox = document.getElementById('vault-image-preview-box');
    const fileInput = document.getElementById('vault-image-file');
    if (previewBox) previewBox.style.display = 'none';
    if (fileInput) fileInput.value = "";
}

function saveVaultCalendar() {
    const dateIn = document.getElementById('vault-date-input');
    const textIn = document.getElementById('vault-calendar-text');
    if (!dateIn || !textIn || !dateIn.value || !textIn.value.trim() || !db) return;

    const item = {
        id: "cal_" + currentUser + "_" + Date.now(),
        user: currentUser,
        date: dateIn.value,
        text: textIn.value.trim(),
        image: vaultSelectedImageBase64
    };

    const tx = db.transaction(["vault_calendar"], "readwrite");
    tx.objectStore("vault_calendar").add(item);
    tx.oncomplete = () => {
        textIn.value = "";
        clearVaultImageSelect();
        loadVaultCalendarFromDB();
    };
}

function loadVaultCalendarFromDB() {
    if (!db) return;
    const request = db.transaction(["vault_calendar"], "readonly").objectStore("vault_calendar").getAll();
    request.onsuccess = () => {
        const list = document.getElementById('vault-calendar-list');
        if (!list) return;
        list.innerHTML = "";
        const myData = request.result.filter(item => item.user === currentUser);
        myData.forEach(item => {
            let imgHtml = "";
            if (item.image) {
                imgHtml = `<div style="margin-top:8px;"><img src="${item.image}"></div>`;
            }
            list.innerHTML += `
                <div class="vault-item-node">
                    <strong>[${item.date}]:</strong> ${item.text}
                    ${imgHtml}
                    <button class="delete-vault-btn" onclick="deleteVaultItem('vault_calendar', '${item.id}', loadVaultCalendarFromDB)">✕</button>
                </div>`;
        });
    };
}
