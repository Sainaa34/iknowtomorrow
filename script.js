// Global State Variables
let currentLang = localStorage.getItem('iknow_lang') || 'en';
let currentTheme = localStorage.getItem('iknow_theme') || 'cyber';
let currentUser = null;
let allPosts = [];
let deletedPostsArchive = [];
let currentTab = 'feed';
let selectedFriend = null;
let db = null; 

// Translations Database
const translations = {
    en: {
        feed: "Timeline",
        friends: "🤝 Friends & Chats",
        chats: "🤖 Future Bot",
        profileSettings: "⚙️ Profile Settings",
        futurePlaceholder: "What will happen in the future? Share here...",
        postBtn: "Post",
        verifiedFuture: "Verified Future",
        writeComment: "Write a comment...",
        botTitle: "Future Bot 🤖",
        sendBtn: "Send",
        bannedWordAlert: "Your post contains banned keywords!",
        searchLabel: "Search Timeline...",
        exitBtn: "🚪 Exit"
    },
    mn: {
        feed: "Таймлайн",
        friends: "🤝 Түншүүд ба Чат",
        chats: "🤖 Ирээдүйн Бот",
        profileSettings: "⚙️ Профайл Тохиргоо",
        futurePlaceholder: "Ирээдүйд юу болох вэ? Энд хуваалц...",
        postBtn: "Нийтлэх",
        verifiedFuture: "Ирээдүй биелсэн",
        writeComment: "Сэтгэгдэл үлдээх...",
        botTitle: "Ирээдүйн Бот 🤖",
        sendBtn: "Илгээх",
        bannedWordAlert: "Таны бичвэрт хориотой үг байна!",
        searchLabel: "Таймлайнаас хайх...",
        exitBtn: "🚪 Гарах"
    }
};

// 🖼️ ЗУРГУУДЫН МАССИВ
const authImages = [
    'Designer (1).png', 'Designer (2).png', 'Designer (3).png',
    'Designer (4).png', 'Designer (5).png', 'Designer (6).png',
    'Designer (7).png', 'Designer (8).png', 'Designer (9).png',
    'Designer (10).png', 'Designer.png'
];

let attachedMedia = null; 
let attachedMediaType = null; 
let modalAttachedAvatar = null;

const bannedKeywords = ["altsgar", "golog", "pizda", "зда", "лайн", "яахуу", "пизда"];

// 🔄 Window Load
window.onload = function() {
    initIndexedDB();
    setupPasswordToggles();
};

// 🔐 АРЫН ЗУРГУУДЫГ ОНООХ
function initAuthPage() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    let shuffled = [...authImages].sort(() => 0.5 - Math.random());
    let leftImg = shuffled[0];
    let rightImg = shuffled[1];
    let centerImg = shuffled[2];

    authContainer.style.backgroundImage = `url('${leftImg}'), url('${rightImg}'), url('${centerImg}')`;
    
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (loginCard) loginCard.style.backgroundImage = `url('${centerImg}')`;
    if (registerCard) registerCard.style.backgroundImage = `url('${centerImg}')`;
}

function showAuthPage(type) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (type === 'register') {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    } else {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    }
}

// 📦 INDEXEDDB СУУРИЛУУЛАХ БОЛОН ФОРМ СОНСОХЫГ ХАМТДАНА
function initIndexedDB() {
    const request = indexedDB.open("iKnowTomorrowDB", 3);

    request.onerror = function(event) {
        console.error("Database error: " + event.target.errorCode);
        initAuthPage();
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        initAuthPage(); 
        setupFormListeners(); // Энд ганцхан удаа зөв холбоно
        checkLoginStatus();
    };

    request.onupgradeneeded = function(event) {
        let dbInstance = event.target.result;
        if (!dbInstance.objectStoreNames.contains("users")) {
            dbInstance.createObjectStore("users", { keyPath: "username" });
        }
        if (!dbInstance.objectStoreNames.contains("posts")) {
            dbInstance.createObjectStore("posts", { keyPath: "id" });
        }
        if (!dbInstance.objectStoreNames.contains("archive")) {
            dbInstance.createObjectStore("archive", { keyPath: "id" });
        }
    };
}

// 🎮 ФОРМЫГ ГАЦААХГҮЙ, СЭРГЭЭХГҮЙ (NO REFRESH) СОНСОХ ХЭСЭГ
function setupFormListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if(loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault(); // Үндсэн ачаалалтыг зогсооно
            handleLogin();
        };
    }

    if(registerForm) {
        registerForm.onsubmit = function(e) {
            e.preventDefault(); // Үндсэн ачаалалтыг зогсооно
            handleRegister();
        };
    }
}

// 👀 НУУЦ ҮГ ХАРАХ / НУУХ (EYE TOGGLE)
function setupPasswordToggles() {
    const toggleLogin = document.getElementById('toggleLoginPassword');
    const loginPass = document.getElementById('login-password');
    if(toggleLogin && loginPass) {
        toggleLogin.onclick = function() {
            const type = loginPass.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPass.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        };
    }

    const toggleReg = document.getElementById('toggleRegPassword');
    const regPass = document.getElementById('reg-password');
    if(toggleReg && regPass) {
        toggleReg.onclick = function() {
            const type = regPass.getAttribute('type') === 'password' ? 'text' : 'password';
            regPass.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        };
    }
}

// 🔑 БҮРТГҮҮЛЭХ
function handleRegister() {
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;

    if(!u || !p) return;

    let transaction = db.transaction(["users"], "readwrite");
    let store = transaction.objectStore("users");
    let getRequest = store.get(u);

    getRequest.onsuccess = function() {
        if (getRequest.result) {
            alert("This identity username already exists in timeline.");
        } else {
            let newUser = { username: u, password: p, avatar: 'Designer.png' };
            store.add(newUser);
            alert("Identity Initialized! Proceed to authentication.");
            document.getElementById('register-form').reset();
            showAuthPage('login');
        }
    };
}

// 🔑 НЭВТРЭХ
function handleLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;

    if(!u || !p) return;

    let transaction = db.transaction(["users"], "readonly");
    let store = transaction.objectStore("users");
    let request = store.get(u);

    request.onsuccess = function() {
        if(request.result && request.result.password === p) {
            currentUser = request.result;
            localStorage.setItem('iknow_logged_user', currentUser.username);
            showMainApp();
        } else {
            alert("Access Denied: Invalid Username or Password Matrix Key.");
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

function checkLoginStatus() {
    let loggedName = localStorage.getItem('iknow_logged_user');
    if(loggedName && db) {
        let transaction = db.transaction(["users"], "readonly");
        let store = transaction.objectStore("users");
        let request = store.get(loggedName);
        request.onsuccess = function() {
            if(request.result) {
                currentUser = request.result;
                showMainApp();
            } else {
                showAuthPage('login');
            }
        };
    } else {
        showAuthPage('login');
    }
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';

    applyTheme(currentTheme);
    updateLanguageUI();
    refreshProfileUI();
    loadPostsFromDB();
    loadOnlineCitizens();
}

function refreshProfileUI() {
    document.getElementById('profile-name').innerText = currentUser.username;
    document.getElementById('profile-avatar').src = currentUser.avatar;
}

// 🔀 LANGUAGES & THEMES
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
    if(currentTheme === 'cyber') currentTheme = 'matrix';
    else if(currentTheme === 'matrix') currentTheme = 'dark';
    else currentTheme = 'cyber';

    localStorage.setItem('iknow_theme', currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    document.body.className = 'theme-' + theme;
    let btn = document.getElementById('theme-btn');
    if(btn) btn.innerText = "🎨 Theme: " + theme.toUpperCase();
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.menu-tab').forEach(el => el.classList.remove('active'));

    document.getElementById('tab-' + tab).style.display = 'block';
    if(tab === 'feed') document.getElementById('feed-btn').classList.add('active');
    if(tab === 'friends') document.getElementById('friends-btn').classList.add('active');
    if(tab === 'chat') document.getElementById('chats-btn').classList.add('active');
}

// 📝 POSTS & COMMENTS
function loadPostsFromDB() {
    if (!db) return;
    let transaction = db.transaction(["posts"], "readonly");
    let store = transaction.objectStore("posts");
    let request = store.getAll();
    request.onsuccess = function() {
        allPosts = request.result || [];
        allPosts.sort((a,b) => b.timestamp - a.timestamp);
        renderFeed(allPosts);
    };
}

function createPost() {
    const textInput = document.getElementById('future-input');
    let text = textInput.value;

    if(!text && !attachedMedia) return;

    let hasBanned = bannedKeywords.some(word => text.toLowerCase().includes(word));
    if(hasBanned) {
        alert(translations[currentLang].bannedWordAlert);
        return;
    }

    let newPost = {
        id: "post_" + Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatar,
        text: text,
        media: attachedMedia,
        mediaType: attachedMediaType,
        timestamp: Date.now(),
        votes: 0,
        voters: [],
        comments: [],
        isVerified: false
    };

    let transaction = db.transaction(["posts"], "readwrite");
    let store = transaction.objectStore("posts");
    store.add(newPost);

    transaction.oncomplete = function() {
        textInput.value = '';
        clearAttachedMedia();
        loadPostsFromDB();
    };
}

function renderFeed(postsToRender) {
    const feedContainer = document.getElementById('feed-container');
    if(!feedContainer) return;
    feedContainer.innerHTML = '';

    postsToRender.forEach(post => {
        let tierClass = "tier-electric";
        if(post.votes >= 10) tierClass = "tier-matrix";
        else if(post.votes >= 5) tierClass = "tier-fire";

        let mediaHtml = '';
        if(post.media) {
            if(post.mediaType === 'image') mediaHtml = `<div class="post-media-content"><img src="${post.media}"></div>`;
            else if(post.mediaType === 'video') mediaHtml = `<div class="post-media-content"><video src="${post.media}" controls></video></div>`;
        }

        let verifyBadge = post.isVerified ? `<span style="color:var(--cyber-yellow); font-size:11px; margin-left:5px;">👁️ ${translations[currentLang].verifiedFuture}</span>` : '';
        let deleteBtnHtml = (post.author === currentUser.username) ? `<button class="delete-btn-red" onclick="deletePost('${post.id}')">❌ Delete</button>` : '';
        let adminVerifyBtn = (currentUser.username.toLowerCase() === 'admin' && !post.isVerified) ? `<button onclick="verifyPost('${post.id}')" style="color:yellow; background:none; border:none; cursor:pointer;">✔️ Verify</button>` : '';

        let commentsHtml = post.comments ? post.comments.map(c => `
            <div style="font-size:12px; background:rgba(0,0,0,0.3); padding:4px; margin-top:3px; border-radius:4px;">
                <strong>${c.author}:</strong> ${c.text}
            </div>
        `).join('') : '';

        let card = document.createElement('div');
        card.className = `post-card ${tierClass}`;
        card.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img class="post-avatar-mini" src="${post.avatar}">
                    <div class="post-meta-text">
                        <h4>${post.author} ${verifyBadge}</h4>
                        <span>${new Date(post.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <div class="vote-tooltip-container">
                        <button class="vote-btn-neon" onclick="votePost('${post.id}')">⚡ Sync (${post.votes})</button>
                        <div class="tooltip-box-text">${post.voters ? post.voters.join(', ') : 'No syncs'}</div>
                    </div>
                    <div class="post-menu-container">
                        <button class="post-more-btn" onclick="togglePostMenu('${post.id}')">⋮</button>
                        <div id="menu-${post.id}" class="post-dropdown-menu">
                            ${deleteBtnHtml}
                            ${adminVerifyBtn}
                            <button onclick="archivePost('${post.id}')">📂 Archive</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-main-text">${post.text}</div>
            ${mediaHtml}
            <div class="comments-section">
                <div id="comments-list-${post.id}">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input id="reply-input-${post.id}" type="text" placeholder="${translations[currentLang].writeComment}">
                    <button class="comment-add-btn" onclick="submitComment('${post.id}')">➔</button>
                </div>
            </div>
        `;
        feedContainer.appendChild(card);
    });
}

function submitComment(postId) {
    const input = document.getElementById(`reply-input-${postId}`);
    let text = input.value.trim();
    if(!text) return;

    let post = allPosts.find(p => p.id === postId);
    if(post) {
        if(!post.comments) post.comments = [];
        post.comments.push({ author: currentUser.username, text: text });
        let transaction = db.transaction(["posts"], "readwrite");
        transaction.objectStore("posts").put(post);
        transaction.oncomplete = function() {
            input.value = '';
            loadPostsFromDB();
        };
    }
}

function votePost(postId) {
    let post = allPosts.find(p => p.id === postId);
    if(!post) return;

    if(!post.voters) post.voters = [];

    if(post.voters.includes(currentUser.username)) {
        post.votes--;
        post.voters = post.voters.filter(v => v !== currentUser.username);
    } else {
        post.votes++;
        post.voters.push(currentUser.username);
    }

    let transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").put(post);
    transaction.oncomplete = function() {
        loadPostsFromDB();
    };
}

function togglePostMenu(id) {
    let menu = document.getElementById("menu-" + id);
    if(menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Пост устгах
function deletePost(id) {
    if(!confirm("Are you sure?")) return;
    let transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").delete(id);
    transaction.oncomplete = function() {
        loadPostsFromDB();
    };
}

function archivePost(id) {
    let post = allPosts.find(p => p.id === id);
    if(!post) return;
    let transaction = db.transaction(["posts", "archive"], "readwrite");
    transaction.objectStore("posts").delete(id);
    transaction.objectStore("archive").add(post);
    transaction.oncomplete = function() {
        alert("Post Archived Vault.");
        loadPostsFromDB();
    };
}

function verifyPost(id) {
    let post = allPosts.find(p => p.id === id);
    if(!post) return;
    post.isVerified = true;
    let transaction = db.transaction(["posts"], "readwrite");
    transaction.objectStore("posts").put(post);
    transaction.oncomplete = function() {
        loadPostsFromDB();
    };
}

function searchPosts() {
    let val = document.getElementById('search-input').value.toLowerCase();
    let matched = allPosts.filter(p => p.text.toLowerCase().includes(val) || p.author.toLowerCase().includes(val));
    renderFeed(matched);
}

// 🖼️ MEDIA PREVIEW
function handleFileSelect(event, type) {
    let file = event.target.files[0];
    if(!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        attachedMedia = e.target.result;
        attachedMediaType = type;

        document.getElementById('post-media-preview-box').style.display = 'block';
        let imgTag = document.getElementById('post-image-preview-img');
        let vidTag = document.getElementById('post-video-preview-vid');

        if(type === 'image') {
            imgTag.src = attachedMedia; imgTag.style.display = 'block';
            vidTag.style.display = 'none';
        } else {
            vidTag.src = attachedMedia; vidTag.style.display = 'block';
            imgTag.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function clearAttachedMedia() {
    attachedMedia = null; attachedMediaType = null;
    document.getElementById('post-media-preview-box').style.display = 'none';
}

// 🤝 CHAT SYSTEMS
function loadOnlineCitizens() {
    if(!db) return;
    let transaction = db.transaction(["users"], "readonly");
    let store = transaction.objectStore("users");
    store.getAll().onsuccess = function(e) {
        let citizens = e.target.result || [];
        let container = document.getElementById('friends-list-container');
        if(!container) return;
        container.innerHTML = '';

        citizens.forEach(c => {
            if(c.username === currentUser.username) return;
            let div = document.createElement('div');
            div.className = "friend-item-row" + (selectedFriend === c.username ? " active" : "");
            div.onclick = () => selectCitizenToChat(c.username);
            div.innerHTML = `<img class="friend-avatar-mini" src="${c.avatar}"> <span>${c.username}</span>`;
            container.appendChild(div);
        });
    };
}

function selectCitizenToChat(name) {
    selectedFriend = name;
    document.getElementById('active-chat-partner').innerText = `💬 Syncing with ${name}`;
    loadOnlineCitizens();
    let box = document.getElementById('friends-chat-messages');
    box.innerHTML = `<div class="msg-row friend-msg"><strong>${name}:</strong> Quantum link stable. Message encryption active.</div>`;
}

function sendFriendMessage() {
    let input = document.getElementById('friends-chat-input');
    let text = input.value.trim();
    if(!text || !selectedFriend) return;

    let box = document.getElementById('friends-chat-messages');
    box.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${text}</div>`;
    input.value = '';
    box.scrollTop = box.scrollHeight;
}

// 🤖 AI BOT
function sendDirectMessage() {
    let input = document.getElementById('bot-input');
    let text = input.value.trim();
    if(!text) return;

    let box = document.getElementById('chat-container');
    box.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${text}</div>`;
    input.value = '';
    box.scrollTop = box.scrollHeight;

    setTimeout(() => {
        box.innerHTML += `<div class="msg-row bot"><strong>Future Bot:</strong> Processing temporal timeline calculations... Your outcome seems bright.</div>`;
        box.scrollTop = box.scrollHeight;
    }, 900);
}

// ⚙️ PROFILE SETTINGS
function openProfileModal() {
    document.getElementById('profile-modal').style.display = 'flex';
    document.getElementById('modal-username').value = currentUser.username;
    document.getElementById('modal-avatar').value = currentUser.avatar;
    modalAttachedAvatar = null;
    renderProfileHistory();
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

function handleAvatarFile(e) {
    let file = e.target.files[0];
    if(!file) return;
    let r = new FileReader();
    r.onload = function(evt) {
        modalAttachedAvatar = evt.target.result;
        document.getElementById('modal-avatar').value = "Uploaded File Matrix";
    };
    r.readAsDataURL(file);
}

function saveProfileModal() {
    let newName = document.getElementById('modal-username').value.trim();
    let textAvatar = document.getElementById('modal-avatar').value.trim();

    if(!newName) return;

    let updatedAvatar = modalAttachedAvatar || (textAvatar !== "Uploaded File Matrix" ? textAvatar : currentUser.avatar);

    let transaction = db.transaction(["users"], "readwrite");
    let store = transaction.objectStore("users");
    
    store.delete(currentUser.username);
    
    currentUser.username = newName;
    currentUser.avatar = updatedAvatar;

    store.put(currentUser);

    transaction.oncomplete = function() {
        localStorage.setItem('iknow_logged_user', currentUser.username);
        alert("Identity Matrix Re-calibrated!");
        closeProfileModal();
        refreshProfileUI();
        loadPostsFromDB();
    };
}

function renderProfileHistory() {
    const postsBox = document.getElementById('profile-posts-history');
    const commentsBox = document.getElementById('profile-comments-history');
    if(!postsBox || !commentsBox) return;

    const myPosts = allPosts.filter(p => p.author === currentUser.username);
    postsBox.innerHTML = myPosts.length ? myPosts.map(p => `
        <div style="border-bottom:1px solid #222; padding:4px 0; color:#fff;">⚡ ${p.text.substring(0, 40)}...</div>
    `).join('') : '<span style="color:#666;">Пост байхгүй байна.</span>';

    let myCommentsCount = 0;
    let commentsHtml = '';
    allPosts.forEach(p => {
        if(p.comments) {
            p.comments.forEach(c => {
                if (c.author === currentUser.username) {
                    myCommentsCount++;
                    commentsHtml += `<div style="border-bottom:1px solid #222; padding:4px 0; color:#fff;">💬 ${c.text.substring(0, 40)}... <small style="color:var(--cyber-cyan)">(${p.author}-ий постон дээр)</small></div>`;
                }
            });
        }
    });
    commentsBox.innerHTML = myCommentsCount ? commentsHtml : '<span style="color:#666;">Сэтгэгдэл байхгүй байна.</span>';
}
