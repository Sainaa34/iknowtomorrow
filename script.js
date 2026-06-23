// ========================================================
// 1. GLOBAL STATE INITIALIZATION & CLEAN ENGLISH MATRIX
// ========================================================
let db = null; 
let currentTheme = localStorage.getItem('iknow_theme') || 'light'; // Initial default theme set to LIGHT
let currentUser = null;
let allPosts = [];
let postAttachedMedia = null;
let activeChatPartner = null;

// Selected media variable for the master calendar log
let vaultSelectedImageBase64 = null;

// Block lists and unseen trackers
let blockedUsers = JSON.parse(localStorage.getItem('iknow_blocked_users')) || {};
let unseenMessagesFrom = JSON.parse(localStorage.getItem('iknow_unseen_msgs')) || {};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

document.addEventListener('DOMContentLoaded', () => {
    document.body.className = "theme-" + currentTheme;
    initIndexedDB();
    checkSession();
});

// Unlimited Database Storage Engine
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 4); // Schema updated to v4 for Messenger and Vault updates
    
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
        loadVaultNotesFromDB();
    };
}
// ========================================================
// 2. IDENTITY BACKDROP MANAGEMENT (LOGIN REFRESH BLOCKS)
// ========================================================
function randomizeAuthImages() {
    const authScreen = document.getElementById('auth-container');
    if (!authScreen) return;

    const availablePool = ['r1.webp', 'r2.jpg', 'r3.jpg', 'r4.jpg', 'r6.jpg', 'r7.jpg', 'r8.jpg', 'r9.jpg'];
    let shuffled = [...availablePool].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 4);

    authScreen.style.backgroundImage = `url('${selected}'), url('${selected}'), url('${selected}'), url('${selected}')`;
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
    randomizeAuthImages();
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

// ========================================================
// 3. SECURE AUTHENTICATION MATRIX & SESSION FLOW
// ========================================================
function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    if (!user || !pass) return;

    localStorage.setItem(`user_${user}`, pass);
    alert("Neural Identity Created Successfully! Please login.");
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
        alert("Access Denied: Invalid Username or Password.");
    }
}

function checkSession() {
    const session = localStorage.getItem('iknow_session');
    if (session) {
        currentUser = session;
        showMainApp();
    } else {
        if (document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'flex';
        if (document.getElementById('main-app')) document.getElementById('main-app').style.display = 'none';
        randomizeAuthImages();
    }
}

function showMainApp() {
    if (document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'none';
    if (document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
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
// ========================================================
// 5. TIMELINE FILE MEDIA CAPTURE PROCESSORS
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
    reader.readAsDataURL(file[0]);
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
// TEXTAREA ДЭЭР ENTER ДАРАХАД ШУУД ПОСТ ОРДОГ БОЛГОХ ТОХИРГОО
document.addEventListener('keydown', (e) => {
    if (e.target && e.target.id === 'future-input') {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createPost();
        }
    }
});

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

        // ЭРЭМБЭЛЭЛТ: Миний пост үргэлж нэгдүгээрт, бусад нь Кристалын тоогоор жагсана
        allPosts.sort((a, b) => {
            const isMeA = a.author === currentUser ? 1 : 0;
            const isMeB = b.author === currentUser ? 1 : 0;
            if (isMeA !== isMeB) return isMeB - isMeA;
            return b.votes - a.votes || b.id.localeCompare(a.id);
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

        // ⏱️ ОГНОО ЗАСАЛТ: Дөнгөж сая оруулсан бол "Just now" харагдана
        let timeDisplay = "Just now";
        if (post.timestamp && typeof post.timestamp === 'number') {
            const diffSec = Math.floor((Date.now() - post.timestamp) / 1000);
            if (diffSec > 59) {
                timeDisplay = new Date(post.timestamp).toLocaleString();
            }
        } else if (typeof post.timestamp === 'string') {
            timeDisplay = post.timestamp;
        }

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
            commentsHtml += `<div class="comment-node"><strong>${c.user}:</strong> ${c.text}</div>`;
        });

        const card = document.createElement('div');
        card.className = "post-card";
        card.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="https://robohash.org{post.author}.png?set=set4" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>${timeDisplay}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <!-- 🔮 БАРУУН ДЭЭД БУЛАНД БАЙДАГ ХУУЧИН КРИСТАЛ ТОХИРГОО -->
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
                    <input type="text" id="input-comm-${post.id}" placeholder="Write a neural response...">
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

function deletePost(postId) {
    if (!confirm("Purge post from matrix timeline?")) return;
    const transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").delete(postId);
    transaction.oncomplete = () => { loadPostsFromDB(); };
}

// Хайлтын систем
function searchPosts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) { renderPosts(allPosts); return; }
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
// 7. REAL-TIME CITIZENS MESSENGER (Facebook Style UI Logic)
// ========================================================
function loadOnlineCitizens() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    // Тест хийхэд хэрэг болох 3 иргэн хэвээр үлдлээ
    let systemCitizens = ["Neo_2050", "Trinity_X", "Morph_Quantum"];
    
    // 🧠 УХААЛАГ ЭРЭМБЭЛЭЛТ: Шинэ мессеж илгээсэн эсвэл уншаагүй мессежтэй хүмүүс хамгийн эхэнд гарна
    systemCitizens.sort((a, b) => {
        const hasUnseenA = unseenMessagesFrom[a] ? 1 : 0;
        const hasUnseenB = unseenMessagesFrom[b] ? 1 : 0;
        
        if (hasUnseenA !== hasUnseenB) {
            return hasUnseenB - hasUnseenA; // Уншаагүй мессежтэйг дээр нь гаргана
        }
        return a.localeCompare(b); // Бусад үед Англи үсгийн дарааллаар (A-Z) жагсана
    });

    systemCitizens.forEach(citizen => {
        // Хэрэглэгч өөрөө өөрийгөө жагсаалтад харахгүй
        if (citizen === currentUser) return;

        const isBlocked = blockedUsers[citizen] ? true : false;
        const hasUnseen = unseenMessagesFrom[citizen] ? true : false;

        const row = document.createElement('div');
        row.className = `friend-item-row ${activeChatPartner === citizen ? 'active' : ''}`;
        
        // Нэр дээр нь дарахад чат нээгдэнэ (Блок хийгээгүй үед)
        row.innerHTML = `
            <div class="friend-user-meta-block" onclick="selectChatPartner('${citizen}')">
                ${hasUnseen ? `<span class="unseen-mark">!!!</span>` : ""}
                <img src="https://robohash.org{citizen}.png?set=set4" class="friend-avatar-mini">
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
    event.stopPropagation(); // Нэр дээр нь давхар дарагдаж чат нээгдэхээс сэргийлнэ
    
    if (blockedUsers[citizenName]) {
        delete blockedUsers[citizenName];
        alert(`${citizenName} has been unblocked.`);
    } else {
        blockedUsers[citizenName] = true;
        alert(`${citizenName} has been blocked. You will no longer receive or send messages to this entity.`);
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
    if (blockedUsers[citizenName]) {
        alert("This entity is blocked. Unblock them first to open chat framework.");
        return;
    }
    
    activeChatPartner = citizenName;
    
    // Чатыг уншсан тул уншаагүй тэмдгийг (!!!) устгана
    if (unseenMessagesFrom[citizenName]) {
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

    if (blockedUsers[activeChatPartner]) {
        alert("Action Aborted: You cannot transmit data to a blocked entity.");
        return;
    }

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
        
        // Мессеж илгээсэн тул жагсаалтын хамгийн дээр гаргахын тулд дахин зуруулна
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

// Сетийн цаанаас шинэ мессеж ирэхийг симуляци хийх ухаалаг функц (Тестлэхэд хэрэг болно)
function simulateIncomingMessage(fromUser, msgText) {
    if (blockedUsers[fromUser] || !db) return;

    const incoming = {
        id: "msg_" + Date.now(),
        sender: fromUser,
        receiver: currentUser,
        text: msgText,
        timestamp: new Date().toLocaleTimeString()
    };

    const transaction = db.transaction(["messages"], "readwrite");
    transaction.objectStore("messages").add(incoming);
    
    transaction.oncomplete = () => {
        if (activeChatPartner === fromUser) {
            loadFriendMessages();
        } else {
            // Чатыг нээж уншаагүй тул !!! тэмдэг тавина
            unseenMessagesFrom[fromUser] = true;
            localStorage.setItem('iknow_unseen_msgs', JSON.stringify(unseenMessagesFrom));
            loadOnlineCitizens();
        }
    };
}
// ========================================================
// 9. 🔒 MASTER CALENDAR VAULT (Strict Multi-User Privacy)
// ========================================================
function saveVaultCalendar() {
    const dateIn = document.getElementById('vault-date-input');
    const textIn = document.getElementById('vault-calendar-text');
    if (!dateIn || !textIn || !dateIn.value || !textIn.value.trim() || !db) return;

    // Бүх тэмдэглэл, зүүд, зураг хэрэглэгчийн нэрээр хамгаалагдаж хадгалагдана
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
        
        // 🔒 АЮУЛГҮЙ БАЙДЛЫН ХАМГААЛАЛТ: Өөр хэрэглэгчдийн өгөгдлийг харуулахгүй, зөвхөн өөрийнхийг шүүнэ
        const myData = request.result.filter(item => item.user === currentUser);
        
        myData.forEach(item => {
            let imgHtml = "";
            if (item.image) {
                imgHtml = `<div style="margin-top:8px;"><img src="${item.image}" style="max-width:100%; max-height:120px; border-radius:6px; border:1px dashed var(--neon-pink);"></div>`;
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

function saveVaultNote() {
    const textIn = document.getElementById('vault-note-text');
    if (!textIn || !textIn.value.trim() || !db) return;

    const item = {
        id: "note_" + currentUser + "_" + Date.now(),
        user: currentUser,
        text: textIn.value.trim(),
        timestamp: new Date().toLocaleDateString()
    };
    const tx = db.transaction(["vault_notes"], "readwrite");
    tx.objectStore("vault_notes").add(item);
    tx.oncomplete = () => {
        textIn.value = "";
        loadVaultNotesFromDB();
    };
}

function loadVaultNotesFromDB() {
    if (!db) return;
    const request = db.transaction(["vault_notes"], "readonly").objectStore("vault_notes").getAll();
    request.onsuccess = () => {
        const list = document.getElementById('vault-notes-list');
        if (!list) return;
        list.innerHTML = "";
        
        // 🔒 Зөвхөн нэвтэрсэн хэрэглэгчийн өөрийнх нь чөлөөт тэмдэглэлүүд уншигдана
        const myData = request.result.filter(item => item.user === currentUser);
        
        myData.forEach(item => {
            list.innerHTML += `
                <div class="vault-item-node">
                    <strong>[${item.timestamp}]:</strong> ${item.text}
                    <button class="delete-vault-btn" onclick="deleteVaultItem('vault_notes', '${item.id}', loadVaultNotesFromDB)">✕</button>
                </div>`;
        });
    };
}

function deleteVaultItem(storeName, id, callback) {
    const tx = db.transaction([storeName], "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => { callback(); };
}

// ========================================================
// 10. 🎨 NEURAL FUTURE IMAGE ARTIST ENGINE (100% Fixed)
// ========================================================
function generateAiImage() {
    const inputEl = document.getElementById('bot-input');
    const prompt = inputEl ? inputEl.value.trim() : "";
    if (!prompt) return;

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    chatContainer.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${prompt}</div>`;
    inputEl.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const aiMsgId = "ai_msg_" + Date.now();
    chatContainer.innerHTML += `
        <div class="msg-row bot" id="${aiMsgId}">
            <strong>AI Artist:</strong> Rendering your future vision timeline, please wait... 🖌️
        </div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
        const aiMsgBox = document.getElementById(aiMsgId);
        if (!aiMsgBox) return;

        // Киберпанк ирээдүйн зургийг үүсгэх үнэгүй тогтвортой API
        const cleanPrompt = encodeURIComponent(prompt + " cyberpunk futuristic cyberpunk aesthetic highly detailed digital art 8k");
        const generatedImageUrl = `https://pollinations.ai{cleanPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 1000)}`;

        // Тэнэг англи үгсийг бүр мөсөн устгаж, зөвхөн цэвэрхэн зураг болгон буулгана (Зургийн хэмжээг хязгаарласан)
        aiMsgBox.innerHTML = `
            <strong>AI Artist:</strong> Visualized your future projection for <em>"${prompt}"</em> into reality:
            <div class="ai-generated-frame">
                <img src="${generatedImageUrl}" alt="Future Vision Data" onerror="this.src='https://placehold.co'">
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 2500);
}

// ========================================================
// 11. IDENTITY UPDATE INTERFACE MODALS & AVATAR RE-RENDER
// ========================================================
function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'flex';
    const userIn = document.getElementById('modal-username');
    if (userIn) userIn.value = currentUser;
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

function saveProfileModal() {
    const userIn = document.getElementById('modal-username');
    if (userIn && userIn.value.trim()) {
        const oldName = currentUser;
        const newName = userIn.value.trim();
        localStorage.setItem('iknow_session', newName);
        currentUser = newName;
        document.getElementById('profile-name').textContent = newName;
        const pass = localStorage.getItem(`user_${oldName}`);
        if (pass) {
            localStorage.setItem(`user_${newName}`, pass);
            localStorage.removeItem(`user_${oldName}`);
        }
    }
    closeProfileModal();
    loadPostsFromDB();
    loadVaultCalendarFromDB();
    loadVaultNotesFromDB();
}

function handleAvatarFile(event) {
    const file = event.target.files;
    if (!file || file.length === 0) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        // 🖼️ АВАТАР ШУУД СОЛИГДДОГ БОЛГОЖ ЗАССАН ЛОГИК
        const headerAvatar = document.getElementById('profile-avatar');
        if (headerAvatar) headerAvatar.src = e.target.result;
        
        // Хэрэглэгчийн өөрийнх нь аватарийг локал санах ойд түр хадгалах
        localStorage.setItem(`avatar_${currentUser}`, e.target.result);
        alert("Neural Profile Avatar successfully updated!");
    };
    reader.readAsDataURL(file[0]); // Сонгосон эхний файлыг зөв уншина
}

// Апп ачаалагдах үед хадгалсан аватар байвал шууд зурах тохиргоог showMainApp дотор залгаж өгөв
const originalShowMainApp = showMainApp;
showMainApp = function() {
    originalShowMainApp();
    const customAvatar = localStorage.getItem(`avatar_${currentUser}`);
    if (customAvatar) {
        const headerAvatar = document.getElementById('profile-avatar');
        if (headerAvatar) headerAvatar.src = customAvatar;
    }
};
