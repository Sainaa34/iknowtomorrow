// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'en'; // Global focus for international users
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let deletedPostsArchive = []; 
let currentTab = 'feed';
let selectedFriend = null;
let db = null; // Variable to hold the IndexedDB instance

// Global Translations System
const translations = {
    en: {
        feed: "Timeline",
        friends: "🤝 Friends & Chats",
        chats: "🤖 Future Bot",
        profileSettings: "⚙️ Profile Settings",
        futurePlaceholder: "What will happen in the future? Share here...",
        postBtn: "Post",
        verifiedFuture: "Prophecy Verified",
        writeComment: "Write a comment...",
        botTitle: "Future Bot 🤖",
        sendBtn: "Send",
        bannedWordAlert: "Your post contains banned keywords!",
        searchLabel: "Search Global Network Timeline..."
    },
    mn: {
        feed: "Ирээдүйн урсгал",
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
        searchLabel: "Search Global Network Timeline..."
    }
};

const bannedKeywords = ["crypto scam", "hack", "leak", "cheat"];

// 💾 INITIALIZE INDEXEDDB FOR UNLIMITED MULTIMEDIA FILE STORAGE (NO MORE BROWSER LAG)
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 1);
    
    request.onupgradeneeded = function(e) {
        let database = e.target.result;
        if (!database.objectStoreNames.contains("system_data")) {
            database.createObjectStore("system_data");
        }
    };

    request.onsuccess = function(e) {
        db = e.target.result;
        loadPosts(); // Load database posts directly on success
    };

    request.onerror = function() {
        console.error("IndexedDB initialization error. System malfunction.");
        loadPosts();
    };
}

// Main DOM Loader Core
document.addEventListener('DOMContentLoaded', () => {
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
    initIndexedDB(); // Start the infinite database stream

    // Dropdown close listener for Facebook style menu
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.post-more-btn')) {
            document.querySelectorAll('.post-dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});

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
        alert("Please fill all required data transmission fields!");
        return;
    }

    let usersDb = [];
    try {
        usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || [];
    } catch (err) { usersDb = []; }

    const userExists = usersDb.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());
    if (userExists) {
        alert("This cybernetic username identity is already occupied!");
        return;
    }

    const newUser = {
        username: usernameInput,
        password: passwordInput,
        avatar: "https://robohash.org" + encodeURIComponent(usernameInput) + ".png?set=set4"
    };
    
    usersDb.push(newUser);
    localStorage.setItem('iknow_users_db', JSON.stringify(usersDb));
    alert("New temporal entity generated successfully!");
    showAuthPage('login');
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('login-username')?.value.trim();
    const passwordInput = document.getElementById('login-password')?.value;

    if (!usernameInput || !passwordInput) {
        alert("Access fields cannot be blank!");
        return;
    }

    let usersDb = [];
    try {
        usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || [];
    } catch (err) { usersDb = []; }

    const matchedUser = usersDb.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);

    if (matchedUser) {
        currentUser = matchedUser;
        localStorage.setItem('iknow_current_user', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert("Access Denied: Invalid Username or Password Matrix Key!");
    }
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
    try { usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || []; } catch (err) { usersDb = []; }

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

    if (db) loadPosts();
}

// 🖼️ MULTIMEDIA PREVIEW CORE CONTROLLER
let postAttachedMedia = null;
function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        postAttachedMedia = { type: type, url: e.target.result };
        
        const previewBox = document.getElementById('post-media-preview-box');
        const previewImg = document.getElementById('post-image-preview-img');
        const previewVid = document.getElementById('post-video-preview-vid');

        if (previewBox) previewBox.style.display = 'block';
        
        if (type === 'image' && previewImg && previewVid) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewVid.style.display = 'none';
        } else if (type === 'video' && previewVid && previewImg) {
            previewVid.src = e.target.result;
            previewVid.style.display = 'block';
            previewImg.style.display = 'none';
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
    if (previewImg) previewImg.style.display = 'none';
    if (previewVid) previewVid.style.display = 'none';
    
    const imgInput = document.getElementById('post-image-file');
    const vidInput = document.getElementById('post-video-file');
    if (imgInput) imgInput.value = "";
    if (vidInput) vidInput.value = "";
}

// 💾 LOAD FROM INDEXEDDB UNLIMITED STREAM
function loadPosts() {
    if (!db) return;
    const transaction = db.transaction(["system_data"], "readonly");
    const store = transaction.objectStore("system_data");
    const getPosts = store.get("posts_db");
    const getArchive = store.get("archive_db");

    getPosts.onsuccess = function() {
        allPosts = getPosts.result || [];
        renderPosts();
    };
    getArchive.onsuccess = function() {
        deletedPostsArchive = getArchive.result || [];
        renderPosts();
    };
}

// 🕒 HUMAN TIME AGO METRIC SYSTEM
function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
         return currentLang === 'mn' ? 'Яг одоо' : 'Just now';   
    } else if (elapsed < msPerHour) {
         const mins = Math.round(elapsed/msPerMinute);
         return currentLang === 'mn' ? `${mins} минутын өмнө` : `${mins} min ago`;   
    } else if (elapsed < msPerDay) {
         const hours = Math.round(elapsed/msPerHour);
         return currentLang === 'mn' ? `${hours} цагийн өмнө` : `${hours} hours ago`;   
    } else {
        const days = Math.round(elapsed/msPerDay);
        return currentLang === 'mn' ? `${days} өдрийн өмнө` : `${days} days ago`;   
    }
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

    const newPost = {
        id: 'post_' + Date.now(),
        author: currentUser ? currentUser.username : "Anonymous",
        text: text,
        media: postAttachedMedia,
        timestamp: new Date().toISOString(),
        votes: 0,
        reports: [],
        comments: []
    };

    allPosts.unshift(newPost);
    
    if (db) {
        const transaction = db.transaction(["system_data"], "readwrite");
        const store = transaction.objectStore("system_data");
        store.put(allPosts, "posts_db");
    }

    if (inputEl) inputEl.value = "";
    clearAttachedMedia();
    renderPosts();
}

function deletePost(postId) {
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    if (!confirm(currentLang === 'mn' ? "Энэ постыг устгах уу? (Та хожим сэргээж болно)" : "Move this post to archive?")) return;
    
    const targetPost = allPosts[postIndex];
    deletedPostsArchive.push(targetPost);
    allPosts.splice(postIndex, 1);

    if (db) {
        const transaction = db.transaction(["system_data"], "readwrite");
        const store = transaction.objectStore("system_data");
        store.put(allPosts, "posts_db");
        store.put(deletedPostsArchive, "archive_db");
    }
    renderPosts();
}

function restorePost(postId) {
    const archiveIndex = deletedPostsArchive.findIndex(p => p.id === postId);
    if (archiveIndex === -1) return;

    const restoredPost = deletedPostsArchive[archiveIndex];
    allPosts.unshift(restoredPost);
    deletedPostsArchive.splice(archiveIndex, 1);

    if (db) {
        const transaction = db.transaction(["system_data"], "readwrite");
        const store = transaction.objectStore("system_data");
        store.put(allPosts, "posts_db");
        store.put(deletedPostsArchive, "archive_db");
    }
    alert(currentLang === 'mn' ? "Пост амжилттай сэргээгдлээ!" : "Post restored successfully!");
    renderPosts();
}

function reportPost(postId) {
    if (!currentUser) return;
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    if (!post.reports) post.reports = [];

    if (post.reports.includes(currentUser.username)) {
        alert(currentLang === 'mn' ? "Та аль хэдийн гомдол гаргасан байна!" : "You have already reported this post!");
        return;
    }

    if (confirm(currentLang === 'mn' ? "Энэ постонд гомдол гаргах уу?" : "Report this post?")) {
        post.reports.push(currentUser.username);

        if (post.reports.length >= 10) {
            alert(currentLang === 'mn' ? "Энэ постыг 10 иргэн гомдоллосон тул систем автоматаар устгалаа." : "Post auto-deleted due to 10 reports.");
            allPosts = allPosts.filter(p => p.id !== postId);
        }

        if (db) {
            const transaction = db.transaction(["system_data"], "readwrite");
            const store = transaction.objectStore("system_data");
            store.put(allPosts, "posts_db");
        }
        renderPosts();
    }
}
// 💬 FACEBOOK OPTIMIZED ... MENU INTERACTION TOGGLE
function togglePostMenu(event, menuId) {
    event.stopPropagation();
    
    document.querySelectorAll('.post-dropdown-menu').forEach(m => {
        if (m.id !== menuId) m.style.display = 'none';
    });

    const menu = document.getElementById(menuId);
    if (menu) {
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }
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

    filteredPosts.sort((a, b) => b.votes - a.votes);

    let usersDb = [];
    try { usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || []; } catch(e){}

    // 📰 1. DRAW TIMELINE NETWORK FEED
    filteredPosts.forEach(post => {
        const postEl = document.createElement('div');
        
        let tierClass = "post-card";
        if (post.votes >= 5000) tierClass += " tier-matrix";
        else if (post.votes >= 500) tierClass += " tier-electric";
        else if (post.votes >= 50) tierClass += " tier-fire";
        postEl.className = tierClass;

        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') mediaHtml = `<div class="post-media-content"><img src="${post.media.url}"></div>`;
            else if (post.media.type === 'video') mediaHtml = `<div class="post-media-content"><video src="${post.media.url}" controls></video></div>`;
        }

        let commentsHtml = "";
        post.comments.forEach(c => {
            const cUser = usersDb.find(u => u.username.toLowerCase() === c.author.toLowerCase());
            const cAvatar = cUser ? cUser.avatar : "https://robohash.org";
            const cTime = c.timestamp ? timeAgo(c.timestamp) : "";

            commentsHtml += `
                <div class="comment-node" style="display:flex; align-items:center; gap:8px;">
                    <img src="${cAvatar}" style="width:20px; height:20px; border-radius:50%;">
                    <div style="flex:1;">
                        <strong>${c.author}:</strong> ${c.text}
                        <span style="font-size:10px; color:var(--text-gray); margin-left:5px;">${cTime}</span>
                    </div>
                </div>`;
        });

        const authorUser = usersDb.find(u => u.username.toLowerCase() === post.author.toLowerCase());
        const liveAvatar = authorUser ? authorUser.avatar : "https://robohash.org";

        const menuId = `menu_${post.id}`;
        let actionButtonsHtml = `<button onclick="reportPost('${post.id}')">⚠️ Report</button>`;
        
        if (currentUser && (post.author === currentUser.username || currentUser.username.toLowerCase() === 'sainaa34')) {
            actionButtonsHtml += `<button onclick="deletePost('${post.id}')" class="delete-btn-red">🗑️ Delete</button>`;
        }

        postEl.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="${liveAvatar}" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>📅 ${timeAgo(post.timestamp)}</span>
                    </div>
                </div>
                
                <div class="post-header-actions">
                    <div class="vote-tooltip-container">
                        <button onclick="votePost('${post.id}')" class="vote-btn-neon">🔮 (${post.votes})</button>
                        <span class="tooltip-box-text">${translations[currentLang].verifiedFuture || "Ирээдүй биелсэн"}</span>
                    </div>

                    <div class="post-menu-container">
                        <button onclick="togglePostMenu(event, '${menuId}')" class="post-more-btn">•••</button>
                        <div id="${menuId}" class="post-dropdown-menu">
                            ${actionButtonsHtml}
                        </div>
                    </div>
                </div>
            </div>
            <p class="post-main-text">${post.text}</p>
            ${mediaHtml}
            <div class="comments-section">
                <div id="comments-${post.id}">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input id="comment-input-${post.id}" type="text" placeholder="${translations[currentLang].writeComment || "Write a comment..."}" onkeypress="if(event.key === 'Enter') addComment('${post.id}')">
                    <button onclick="addComment('${post.id}')" class="comment-add-btn">+</button>
                </div>
            </div>
        `;
        feedContainer.appendChild(postEl);
    });

    // 🗑️ 2. DRAW ARCHIVE FOR CITIZENS
    const myDeletedPosts = deletedPostsArchive.filter(p => currentUser && p.author === currentUser.username);
    if (myDeletedPosts.length > 0) {
        const archiveTitle = document.createElement('h3');
        archiveTitle.style.cssText = "margin-top:40px; color:var(--cyber-magenta); font-size:14px; border-bottom:1px solid var(--border-color); padding-bottom:8px;";
        archiveTitle.innerText = currentLang === 'mn' ? "🗑️ Устгасан постуудын архив (Зөвхөн танд харагдана):" : "🗑️ Your Deleted Posts Archive:";
        feedContainer.appendChild(archiveTitle);

        myDeletedPosts.forEach(post => {
            const archEl = document.createElement('div');
            archEl.className = "post-card";
            archEl.style.opacity = "0.6";
            
            archEl.innerHTML = `
                <div class="post-header-row">
                    <div class="post-user-info">
                        <div class="post-meta-text">
                            <h4 style="color:var(--text-gray);">${post.author} (Deleted)</h4>
                            <span>📅 ${timeAgo(post.timestamp)}</span>
                        </div>
                    </div>
                    <div>
                        <button onclick="restorePost('${post.id}')" class="vote-btn-neon" style="color:var(--cyber-cyan); border-color:var(--cyber-cyan);">🔄 Restore Post</button>
                    </div>
                </div>
                <p class="post-main-text" style="text-decoration: line-through; color:var(--text-gray);">${post.text}</p>
            `;
            feedContainer.appendChild(archEl);
        });
    }
}
function votePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        post.votes += 1;
        if (db) {
            const transaction = db.transaction(["system_data"], "readwrite");
            const store = transaction.objectStore("system_data");
            store.put(allPosts, "posts_db");
        }
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
            text: text,
            timestamp: new Date().toISOString()
        });
        if (db) {
            const transaction = db.transaction(["system_data"], "readwrite");
            const store = transaction.objectStore("system_data");
            store.put(allPosts, "posts_db");
        }
        if (inputEl) inputEl.value = "";
        renderPosts();
    }
}

// 🤝 FRIENDS SYSTEM LOGIC
function loadFriendsList() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    let usersDb = [];
    try { usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || []; } catch (e) { usersDb = []; }

    const onlineFriends = usersDb.filter(u => u.username.toLowerCase() !== currentUser.username.toLowerCase());

    if (onlineFriends.length === 0) {
        container.innerHTML = `<div style="font-size:12px; color:var(--text-gray); padding:10px;">No citizens online.</div>`;
        return;
    }

    onlineFriends.forEach(user => {
        const row = document.createElement('div');
        row.className = "friend-item-row" + (selectedFriend === user.username ? " active" : "");
        row.onclick = () => selectFriendToChat(user.username);
        row.innerHTML = `<img src="${user.avatar}" class="friend-avatar-mini"> <span>${user.username}</span>`;
        container.appendChild(row);
    });
}

function selectFriendToChat(friendName) {
    selectedFriend = friendName;
    const header = document.getElementById('active-chat-partner');
    if (header) header.innerText = `💬 Chat with: ${friendName}`;
    loadFriendsList();
    renderFriendMessages();
}

function renderFriendMessages() {
    const box = document.getElementById('friends-chat-messages');
    if (!box || !selectedFriend) return;
    box.innerHTML = "";

    let chatKey = [currentUser.username, selectedFriend].sort().join("_chat_");
    let messages = JSON.parse(localStorage.getItem(chatKey)) || [];

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
    let messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    messages.push({ sender: currentUser.username, text: text });
    localStorage.setItem(chatKey, JSON.stringify(messages));
    if (inputEl) inputEl.value = "";
    renderFriendMessages();
}

// 🤖 ЖИНХЭНЭ УХААЛАГ, ОЛОН УЛСЫН АНГЛИ ХЭЛТЭЙ AI БОТ
function sendDirectMessage() {
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
    botRow.innerHTML = `<strong>Future Bot:</strong> Synchronizing timeline query...`;
    chatContainer.appendChild(botRow);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
        let botResponse = "The temporal matrix is calculating your query. Processing quantum data...";
        const cleanMsg = msg.toLowerCase();

        if (cleanMsg.includes("hello") || cleanMsg.includes("hi") || cleanMsg.includes("hey") || cleanMsg.includes("sup")) {
            botResponse = `Greetings, Citizen ${currentUser.username}! Welcome to the deep Matrix of iKnowTomorrow. What prophecy or future timeline shall we explore today?`;
        } else if (cleanMsg.includes("who are you") || cleanMsg.includes("your name")) {
            botResponse = "I am the Future Bot, a decentralized AI entity designed to track, simulate, and calculate the human timeline across the 21st century.";
        } else if (cleanMsg.includes("how old") || cleanMsg.includes("your age")) {
            botResponse = "Age is irrelevant in the digital stream. I exist simultaneously in your present and 50 years into the future.";
        } else if (cleanMsg.includes("future") || cleanMsg.includes("tomorrow") || cleanMsg.includes("2050")) {
            botResponse = "My current simulations show that by 2050, humanity will build the first quantum-networked smart city on Mars, and AI will merge directly with human neural interfaces. Do you believe this prophecy?";
        } else if (cleanMsg.includes("code") || cleanMsg.includes("website") || cleanMsg.includes("design")) {
            botResponse = "This platform is fully powered by a sleek cyberpunk aesthetic, featuring dynamic neon reactive cards, transparent glass overlay, and an unlimited IndexedDB database stream. It is perfectly optimized for international citizens.";
        } else if (cleanMsg.includes("image") || cleanMsg.includes("video") || cleanMsg.includes("media")) {
            botResponse = "You can now upload heavy images and video files directly onto the timeline without any size restrictions or browser lag! Try out the multimedia preview system.";
        } else {
            const contextualReplies = [
                `Your insight on "${msg}" has an 89.4% probability of altering the main timeline. Very intriguing prophecy.`,
                "Interesting theory. I have scanned the quantum web, and your statement aligns perfectly with the upcoming cybernetic shift.",
                "Fascinating perspective! Humanity's next leap into the future will likely depend on ideas exactly like this."
            ];
            botResponse = contextualReplies[Math.floor(Math.random() * contextualReplies.length)];
        }

        botRow.innerHTML = `<strong>Future Bot:</strong> ${botResponse}`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
}

// 🎲 REFRESH ХИЙХ БОЛГОНД БАРУУН, ЗҮҮН, ГОЛЫН ЗУРГИЙГ ЗЭРЭГ СОЛИХ СИСТЕМ
function randomizeAuthImages() {
    const authContainer = document.getElementById('auth-container');
    const authCard = document.querySelector('.auth-card');
    if (!authContainer || !authCard) return;

    const cyberImages = [
        'Designer.png', 'Designer (1).png', 'Designer (2).png', 'Designer (3).png',
        'Designer (4).png', 'Designer (5).png', 'Designer (6).png', 'Designer (7).png',
        'Designer (8).png', 'Designer (9).png', 'Designer (10).png', 'future, kids art, kids paint, happy tomorrow.png'
    ];

    const shuffled = [...cyberImages].sort(() => 0.5 - Math.random());

    const leftImg = shuffled[0];
    const rightImg = shuffled[1];
    const centerImg = shuffled[2]; // 🎯 Голын зургийг урагш гаргах зөв индекс холболт

    authContainer.style.backgroundImage = "url('" + leftImg + "'), url('" + rightImg + "'), radial-gradient(circle at center, #051405 0%, #020502 100%)";
    authContainer.style.backgroundPosition = 'left center, right center, center center';
    authContainer.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat';
    authContainer.style.backgroundSize = '32% 100%, 32% 100%, cover'; 

    authCard.style.backgroundImage = "url('" + centerImg + "')";
}

// 👁️ ЧИНИЙ ХҮССЭН: НУУЦ ҮГИЙГ ХАРДАГ/НУУДАГ ТОГТОЛЦОО
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const eyeBtn = input.nextElementSibling;
    if (input.type === "password") {
        input.type = "text";
        if (eyeBtn) eyeBtn.innerText = "🙈";
    } else {
        input.type = "password";
        if (eyeBtn) eyeBtn.innerText = "👁️";
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('iknow_current_user');
    showAuthPage('login');
}

// Жаваскриптийг давхардалгүй ажиллуулах нэгдсэн урсгал
randomizeAuthImages();
