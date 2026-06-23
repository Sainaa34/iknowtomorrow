// ========================================================
// 1. GLOBAL NETWORK STATE & TIMELINE INITIALIZATION
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
        vault: "🔒 Private Vault",
        bot: "🎨 Artist AI",
        search: "Search Global Network Timeline...",
        placeholder: "What will happen tomorrow? Share your vision...",
        postBtn: "Publish Vision",
        logout: "Disconnect"
    },
    mn: {
        feed: "Ирээдүйн урсгал",
        friends: "🤝 Найзууд & Чат",
        vault: "🔒 Хувийн орон зай",
        bot: "🎨 Ирээдүйг Зурах AI",
        search: "Ирээдүйн урсгалаас хайх...",
        placeholder: "Ирээдүйд юу болох вэ? Энд хуваалц...",
        postBtn: "Нийтлэх",
        logout: "Гарах"
    }
};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

document.addEventListener('DOMContentLoaded', () => {
    document.body.className = "theme-" + currentTheme;
    applyTranslations();
    initIndexedDB();
    checkSession();
});

// Unlimited Database Storage Engine
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 2); // Schema Version Updated
    
    request.onupgradeneeded = (e) => {
        const localDB = e.target.result;
        if (!localDB.objectStoreNames.contains("posts")) {
            localDB.createObjectStore("posts", { keyPath: "id" });
        }
        if (!localDB.objectStoreNames.contains("messages")) {
            localDB.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        }
        // 🔒 Хувийн орон зайд зориулсан шинэ хадгалах савнууд
        if (!localDB.objectStoreNames.contains("vault_calendar")) {
            localDB.createObjectStore("vault_calendar", { keyPath: "id" });
        }
        if (!localDB.objectStoreNames.contains("vault_notes")) {
            localDB.createObjectStore("vault_notes", { keyPath: "id" });
        }
        if (!localDB.objectStoreNames.contains("vault_gallery")) {
            localDB.createObjectStore("vault_gallery", { keyPath: "id" });
        }
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        loadPostsFromDB();
        loadVaultCalendarFromDB();
        loadVaultNotesFromDB();
        loadVaultGalleryFromDB();
    };
}
// ========================================================
// 2. USER CUSTOM MP3 MUSIC PLAYER SYSTEM
// ========================================================
function handleUserMusic(event) {
    const file = event.target.files[0];
    if (!file) return;

    const audio = document.getElementById('cyber-audio-engine');
    const controls = document.getElementById('player-controls');
    const label = document.getElementById('music-label');
    const trackName = document.getElementById('track-name-display');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (!audio || !controls || !label || !trackName) return;

    audio.src = URL.createObjectURL(file);
    trackName.textContent = file.name;
    
    label.style.display = 'none';
    controls.style.style.display = 'flex';
    
    audio.play();
    playPauseBtn.textContent = "⏸";
}

function toggleUserMusic() {
    const audio = document.getElementById('cyber-audio-engine');
    const btn = document.getElementById('play-pause-btn');
    if (!audio || !btn) return;

    if (audio.paused) {
        audio.play();
        btn.textContent = "⏸";
    } else {
        audio.pause();
        btn.textContent = "▶";
    }
}

function closeUserMusic() {
    const audio = document.getElementById('cyber-audio-engine');
    const controls = document.getElementById('player-controls');
    const label = document.getElementById('music-label');
    const fileInput = document.getElementById('user-mp3-file');

    if (audio) audio.pause();
    if (controls) controls.style.display = 'none';
    if (label) label.style.display = 'block';
    if (fileInput) fileInput.value = "";
}

// ========================================================
// 3. AUTHENTICATION SYSTEMS & DYNAMIC BACKDROP IMAGES
// ========================================================
function randomizeAuthImages() {
    const authScreen = document.getElementById('auth-container');
    if (!authScreen) return;

    const availablePool = ['r1.webp', 'r2.jpg', 'r3.jpg', 'r4.jpg', 'r6.jpg', 'r7.jpg', 'r8.jpg', 'r9.jpg'];
    let shuffled = [...availablePool].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 4);

    authScreen.style.backgroundImage = `url('${selected[0]}'), url('${selected[1]}'), url('${selected[2]}'), url('${selected[3]}')`;
}

function showAuthPage(page) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (page === 'register') {
        if(loginCard) loginCard.style.display = 'none';
        if(registerCard) registerCard.style.display = 'block';
    } else {
        if(loginCard) loginCard.style.display = 'block';
        if(registerCard) registerCard.style.display = 'none';
    }
    randomizeAuthImages();
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    if (!user || !pass) return;

    localStorage.setItem(`user_${user}`, pass);
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
        showMainApp();
    } else {
        alert("Access Denied: Invalid Access Matrix.");
    }
}

function checkSession() {
    const session = localStorage.getItem('iknow_session');
    if (session) {
        currentUser = session;
        showMainApp();
    } else {
        if(document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'flex';
        if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'none';
        randomizeAuthImages();
    }
}

function showMainApp() {
    if(document.getElementById('auth-container')) document.getElementById('auth-container').style.display = 'none';
    if(document.getElementById('main-app')) document.getElementById('main-app').style.display = 'block';
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

function applyTranslations() {
    const elements = {
        'feed-btn': translations[currentLang].feed,
        'friends-btn': translations[currentLang].friends,
        'vault-btn': translations[currentLang].vault,
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
    const themes = ['cyber', 'matrix', 'dark', 'light']; // Цагаан загвар (light) шинээр нэмэгдсэн
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
// 4. MULTIMEDIA PROCESSING & SECURITY FILTERS
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
// 5. SMART FEED SORTING & REAL LIKE/UNLIKE LOGIC
// ========================================================
function createPost() {
    const inputEl = document.getElementById('future-input');
    const text = inputEl ? inputEl.value.trim() : "";
    if (!text && !postAttachedMedia) return;

    if (bannedKeywords.some(word => text.toLowerCase().includes(word))) {
        alert("System Error: Malicious data pattern detected.");
        return;
    }

    const newPost = {
        id: "post_" + Date.now(),
        author: currentUser,
        text: text,
        media: postAttachedMedia,
        votes: 0,
        voters: [], // Лайк дарсан хүмүүсийн ID хадгалах массив
        comments: [],
        timestamp: new Date().toLocaleString()
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

        // 🧠 УХААЛАГ ЭРЭМБЭЛЭЛТ: Өөрийн пост үргэлж нэгдүгээрт, бусад нь Like-оор жагсана [1]
        allPosts.sort((a, b) => {
            const isMeA = a.author === currentUser ? 1 : 0;
            const isMeB = b.author === currentUser ? 1 : 0;
            
            if (isMeA !== isMeB) {
                return isMeB - isMeA; // Өөрийн постыг хамгийн дээр нь гаргана
            }
            return b.votes - a.votes || b.id.localeCompare(a.id); // Бусдыг нь Like-ны тоогоор
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
        const hasLiked = post.voters.includes(currentUser);

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
                        <span>${post.timestamp}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <!-- Like/Unlike болсноор класс нь .liked болж өөрчлөгдөнө -->
                    <button class="vote-btn-neon ${hasLiked ? 'liked' : ''}" onclick="votePost('${post.id}')">
                        👍 Like ${post.votes}
                    </button>
                    ${post.author === currentUser ? `<button class="post-more-btn" onclick="deletePost('${post.id}')">✕</button>` : ""}
                </div>
            </div>
            <div class="post-main-text">${post.text}</div>
            ${mediaHtml}
            <div class="comments-section">
                <div class="comments-list">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input type="text" id="input-comm-${post.id}" placeholder="Response...">
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
        
        // 🔄 БОДИТ LIKE / UNLIKE ЛОГИК (Хязгаарлалттай)
        if (post.voters.includes(currentUser)) {
            post.votes--;
            post.voters = post.voters.filter(v => v !== currentUser); // Дахин дарвал Like цуцлагдана
        } else {
            post.votes++;
            post.voters.push(currentUser); // Шинээр Like нэмнэ
        }
        store.put(post);
    };

    transaction.oncomplete = () => { loadPostsFromDB(); };
}

function deletePost(postId) {
    if (!confirm("Delete post?")) return;
    const transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").delete(postId);
    transaction.oncomplete = () => { loadPostsFromDB(); };
}

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
// 6. REAL-TIME CITIZENS & SAFE PRIVACY CHATS SYSTEM
// ========================================================
function loadOnlineCitizens() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";
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
// 7. 🔒 PRIVATE VAULT AREA ENGINE (Хувийн Орон Зай)
// ========================================================
function saveVaultCalendar() {
    const dateIn = document.getElementById('vault-date-input');
    const textIn = document.getElementById('vault-calendar-text');
    if (!dateIn || !textIn || !dateIn.value || !textIn.value.trim() || !db) return;

    const item = {
        id: "cal_" + currentUser + "_" + Date.now(),
        user: currentUser,
        date: dateIn.value,
        text: textIn.value.trim()
    };
    const tx = db.transaction(["vault_calendar"], "readwrite");
    tx.objectStore("vault_calendar").add(item);
    tx.oncomplete = () => {
        textIn.value = "";
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
            list.innerHTML += `
                <div class="vault-item-node">
                    <strong>[${item.date}]:</strong> ${item.text}
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

function handleVaultImage(event) {
    const file = event.target.files;
    if (!file || !db) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const item = {
            id: "img_" + currentUser + "_" + Date.now(),
            user: currentUser,
            url: e.target.result
        };
        const tx = db.transaction(["vault_gallery"], "readwrite");
        tx.objectStore("vault_gallery").add(item);
        tx.oncomplete = () => { loadVaultGalleryFromDB(); };
    };
    reader.readAsDataURL(file);
}

function loadVaultGalleryFromDB() {
    if (!db) return;
    const request = db.transaction(["vault_gallery"], "readonly").objectStore("vault_gallery").getAll();
    request.onsuccess = () => {
        const container = document.getElementById('vault-gallery-container');
        if (!container) return;
        container.innerHTML = "";
        const myData = request.result.filter(item => item.user === currentUser);
        myData.forEach(item => {
            const img = document.createElement('img');
            img.src = item.url;
            img.className = "vault-gallery-img";
            img.onclick = () => {
                if(confirm("Энэ нууц зургийг устгах уу?")) {
                    deleteVaultItem('vault_gallery', item.id, loadVaultGalleryFromDB);
                }
            };
            container.appendChild(img);
        });
    };
}

function deleteVaultItem(storeName, id, callback) {
    const tx = db.transaction([storeName], "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => { callback(); };
}

// ========================================================
// 8. 🎨 FUTURE IMAGE ARTIST AI ENGINE (Зураг бүтээгч бот)
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
            <strong>AI Artist:</strong> Таны төсөөллийг матрицад зурж байна, түр хүлээнэ үү... 🖌️
        </div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
        const aiMsgBox = document.getElementById(aiMsgId);
        if (!aiMsgBox) return;

        const cleanPrompt = encodeURIComponent(prompt + " cyberpunk futuristic style cyberpunk aesthetic highly detailed digital art");
        const generatedImageUrl = `https://pollinations.ai{cleanPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 1000)}`;

        aiMsgBox.innerHTML = `
            <strong>AI Artist:</strong> Таны бичсэн <em>"${prompt}"</em> төсөөллийг ирээдүйн зураг болгон буулгалаа:
            <div class="ai-generated-frame">
                <img src="${generatedImageUrl}" alt="Future Vision Data" onerror="this.src='https://placehold.co'">
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 2500);
}

// ========================================================
// 9. IDENTITY UPDATE INTERFACE MODALS
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
    loadVaultGalleryFromDB();
}

function handleAvatarFile(event) {
    const file = event.target.files;
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
