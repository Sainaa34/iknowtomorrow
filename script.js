// ========================================================
// 1. GLOBAL STATE INITIALIZATION & TRANSLATION CONSTANTS
// ========================================================
let db = null;
let currentTheme = localStorage.getItem('iknow_theme') || 'light';
let currentLanguage = localStorage.getItem('iknow_lang') || 'en'; // Default entry language set to English
let currentUser = null;
let allPosts = [];
let blockedUsers = JSON.parse(localStorage.getItem('iknow_blocked_users')) || {};
let unseenMessagesFrom = JSON.parse(localStorage.getItem('iknow_unseen_msgs')) || {};
const bannedKeywords = ["crypto scam", "hack", "leak", "cheat", "скам", "хакердах"];

let postAttachedMedia = null; 
let vaultAttachedImage = null;
let modalSelectedAvatarBase64 = null;
let activeChatPartnerName = null;

// 🌐 MASTER INTERNATIONALIZATION LANGUAGE DICTIONARY
const translations = {
    en: {
        login_title: "Access Future Network",
        login_btn: "Enter Timeline",
        google_btn: "Connect via Google Neural Gateway",
        no_account: "New Citizen?",
        create_identity: "Create Identity",
        register_title: "Create Neural Identity",
        register_btn: "Register Identity",
        have_account: "Already registered?",
        sign_in: "Sign In",
        logout_btn: "Disconnect",
        nav_feed: "Future Feed",
        nav_chats: "Encrypted Chat",
        nav_vault: "Private Vault",
        nav_ai: "Artist AI",
        feed_input_placeholder: "What will happen tomorrow? Share your vision...",
        publish_btn: "Publish Vision",
        search_placeholder: "Search Global Network Timeline or Comments...",
        online_citizens: "Online Citizens",
        select_chat_prompt: "💬 Select a neural citizen to initiate chat",
        chat_input_placeholder: "Type encrypted message...",
        vault_title: "Secure Timeline Log",
        vault_input_placeholder: "Log your personal predictions or secure memories...",
        vault_save_btn: "Encrypt to Vault",
        vault_records: "Encrypted Logs",
        ai_header: "What is your vision for the future?",
        ai_input_placeholder: "Describe the future world you see in your mind (e.g., Flying neon cars through cyber canyons)...",
        ai_btn: "Paint Future Vision",
        modal_title: "Update Neural Avatar",
        modal_save: "Save Changes",
        prophecy_text: "Prophecy Verified"
    },
    mn: {
        login_title: "Ирээдүйн Сүлжээнд Нэвтрэх",
        login_btn: "Цагийн шугамд орох",
        google_btn: "Google Neural Gateway-ээр холбогдох",
        no_account: "Шинэ иргэн үү?",
        create_identity: "Хаяг үүсгэх",
        register_title: "Шинэ иргэний бүртгэл үүсгэх",
        register_btn: "Бүртгүүлэх",
        have_account: "Бүртгэлтэй юу?",
        sign_in: "Нэвтрэх",
        logout_btn: "Сүлжээнээс гарах",
        nav_feed: "Ирээдүйн урсгал",
        nav_chats: "Нууцлагдсан чат",
        nav_vault: "Хувийн сейф",
        nav_ai: "AI Зураач",
        feed_input_placeholder: "Маргааш юу болох вэ? Ирээдүйг зөгнөн бичнэ үү...",
        publish_btn: "Зөгнөлийг нийтлэх",
        search_placeholder: "Цагийн шугам эсвэл сэтгэгдлээс хайх...",
        online_citizens: "Холбогдсон иргэд",
        select_chat_prompt: "💬 Чатлахын тулд иргэний хаяг дээр дарна уу",
        chat_input_placeholder: "Нууцлагдсан зурвас бичих...",
        vault_title: "Цаг хугацааны хамгаалалттай тэмдэглэл",
        vault_input_placeholder: "Хувийн зөгнөл, нууц дурсамжаа сейфэндээ үлдээ...",
        vault_save_btn: "Сейфэнд түгжих",
        vault_records: "Шифрлэгдсэн тэмдэглэлүүд",
        ai_header: "Ирээдүйд юу болно гэж бодож байна вэ?",
        ai_input_placeholder: "Тархиндаа харж буй ирээдүйн ертөнцийг дүрсэл (Жишээ нь: Кибер хавцлаар нисэж буй неон машинууд)...",
        ai_btn: "Ирээдүйн зургийг зуруулах",
        modal_title: "Профайл зураг шинэчлэх",
        modal_save: "Өөрчлөлтийг хадгалах",
        prophecy_text: "Зөгнөл баталгаажсан"
    }
};

// Application Global Orchestrator
document.addEventListener('DOMContentLoaded', () => {
    document.body.className = "theme-" + currentTheme;
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.textContent = `🎨 Theme: ${currentTheme.toUpperCase()}`;
    
    initIndexedDB();
    checkSession();
    applyLanguage(currentLanguage);
});
// ========================================================
// 1.2 INDEXEDDB STORAGE CAPABILITY CAPTURE
// ========================================================
function initIndexedDB() {
    // Structural connection to continuous memory pools
    const request = indexedDB.open("iKnowTomorrowDB", 5);

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

    request.onerror = (e) => {
        console.error("IndexedDB critical connection failure:", e.target.error);
    };
}

// ========================================================
// 1.3 INTERNATIONALIZATION LANGUAGE GATEWAY UTILITIES
// ========================================================
function toggleLanguageSelector() {
    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function changeLanguage(langCode) {
    currentLanguage = langCode;
    localStorage.setItem('iknow_lang', langCode);
    applyLanguage(langCode);
    
    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.textContent = `🌐 Language: ${langCode.toUpperCase()}`;
    }
    
    // Dynamically re-render components to push interface-level translations
    loadPostsFromDB();
    loadOnlineCitizens();
}

function applyLanguage(lang) {
    // 1. Translate elements holding text markers
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // 2. Translate text input element placeholders
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
}
// ========================================================
// 2. IDENTITY MANAGEMENT & AUTHENTICATION PORTALS
// ========================================================
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
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

// ========================================================
// 3. AUTHENTICATION TRANSACTION CONTROLLERS
// ========================================================
function handleRegister(e) {
    e.preventDefault();
    const userField = document.getElementById('reg-username');
    const passField = document.getElementById('reg-password');
    if (!userField || !passField) return;

    const username = userField.value.trim();
    const password = passField.value;

    if (localStorage.getItem(`user_${username}`)) {
        alert("This neural identity already exists within the timeline!");
        return;
    }

    localStorage.setItem(`user_${username}`, password);
    alert("Neural Identity registered successfully! Please sign in.");
    showAuthPage('login');
}

function handleLogin(e) {
    e.preventDefault();
    const userField = document.getElementById('login-username');
    const passField = document.getElementById('login-password');
    if (!userField || !passField) return;

    const username = userField.value.trim();
    const password = passField.value;
    const storedPassword = localStorage.getItem(`user_${username}`);

    if (storedPassword && storedPassword === password) {
        currentUser = username;
        localStorage.setItem('iknow_session', username);
        showMainApp();
    } else {
        alert("Invalid authorization clearance parameters!");
    }
}

// 🛠 Patched: Authentic simulated Google Sign-In with dynamic input handling
function handleGoogleAuth() {
    const googleEmail = prompt("Enter your Google Account email address to link:", "citizen@gmail.com");
    
    if (!googleEmail) {
        alert("Google authentication pathway cancelled!");
        return;
    }
    
    if (!googleEmail.includes("@") || !googleEmail.includes(".")) {
        alert("Invalid neural transmission coordinates (Email structure error)!");
        return;
    }

    const cleanedName = googleEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const googleUser = `${cleanedName}_G`;
    
    currentUser = googleUser;
    localStorage.setItem('iknow_session', googleUser);
    
    if (!localStorage.getItem(`user_${googleUser}`)) {
        localStorage.setItem(`user_${googleUser}`, "GOOGLE_FEDERATED_CLEARANCE_2026");
    }
    
    alert(`Successfully authenticated via Google Gateway: ${googleEmail}`);
    showMainApp();
}

function checkSession() {
    const activeSession = localStorage.getItem('iknow_session');
    if (activeSession) {
        currentUser = activeSession;
        showMainApp();
    } else {
        const mainApp = document.getElementById('main-app');
        const authContainer = document.getElementById('auth-container');
        if (mainApp) mainApp.style.display = 'none';
        if (authContainer) authContainer.style.display = 'flex';
    }
}

function showMainApp() {
    const mainApp = document.getElementById('main-app');
    const authContainer = document.getElementById('auth-container');
    if (mainApp) mainApp.style.display = 'block';
    if (authContainer) authContainer.style.display = 'none';

    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = currentUser;

    const headerAvatar = document.getElementById('profile-avatar');
    if (headerAvatar) {
        const savedAvatar = localStorage.getItem(`avatar_${currentUser}`);
        headerAvatar.src = savedAvatar || "avatar.png";
    }

    loadPostsFromDB();
    loadOnlineCitizens();
    loadVaultCalendarFromDB();
    switchTab('feed');
}

function handleLogout() {
    localStorage.removeItem('iknow_session');
    currentUser = null;
    checkSession();
}
// ========================================================
// 4. INTERACTIVE NAVIGATION FRAMEWORK & DYNAMIC THEMES
// ========================================================
function toggleTheme() {
    const themes = ['light', 'dark', 'matrix', 'cyber'];
    let nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    currentTheme = themes[nextIdx];
    
    localStorage.setItem('iknow_theme', currentTheme);
    document.body.className = "theme-" + currentTheme;
    
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.textContent = `🎨 Theme: ${currentTheme.toUpperCase()}`;
    }
}

function switchTab(tabId) {
    const tabs = ['feed', 'chats', 'vault', 'ai'];
    tabs.forEach(t => {
        const panel = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`${t}-btn`);
        
        if (panel) panel.style.display = (t === tabId) ? 'block' : 'none';
        if (btn) {
            if (t === tabId) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
    
    // Trigger localized sync on target interfaces
    if (tabId === 'chats') {
        loadOnlineCitizens();
    } else if (tabId === 'vault') {
        loadVaultCalendarFromDB();
    }
}

// 🌐 Dynamic Core State Reset Mechanism
// Safely flushes view filters, search terms, and resets focus to the top feed
function resetAppToHome() {
    const searchField = document.getElementById('search-input');
    const inputField = document.getElementById('future-input');
    
    if (searchField) searchField.value = "";
    if (inputField) inputField.value = "";
    
    clearAttachedMedia();
    switchTab('feed');
    loadPostsFromDB();
}

// ========================================================
// 5. TIMELINE MULTIMEDIA CAPTURE INTERFACES
// ========================================================
function handleFileSelect(event, type) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const targetFile = files[0]; // 🛠 Real Array index patch - guarantees file reading stability
    const reader = new FileReader();
    
    reader.onload = (e) => {
        postAttachedMedia = {
            type: type,
            url: e.target.result
        };
        
        const previewBox = document.getElementById('post-media-preview-box');
        const imgTag = document.getElementById('post-image-preview-img');
        const vidTag = document.getElementById('post-video-preview-vid');
        
        if (previewBox) previewBox.style.display = 'block';
        
        if (type === 'image') {
            if (imgTag) { imgTag.src = e.target.result; imgTag.style.display = 'block'; }
            if (vidTag) vidTag.style.display = 'none';
        } else if (type === 'video') {
            if (vidTag) { vidTag.src = e.target.result; vidTag.style.display = 'block'; }
            if (imgTag) imgTag.style.display = 'none';
        }
    };
    
    reader.readAsDataURL(targetFile);
}

function clearAttachedMedia() {
    postAttachedMedia = null;
    const postImg = document.getElementById('post-image-file');
    const postVid = document.getElementById('post-video-file');
    
    if (postImg) postImg.value = "";
    if (postVid) postVid.value = "";
    
    const previewBox = document.getElementById('post-media-preview-box');
    const imgTag = document.getElementById('post-image-preview-img');
    const vidTag = document.getElementById('post-video-preview-vid');
    
    if (previewBox) previewBox.style.display = 'none';
    if (imgTag) imgTag.style.display = 'none';
    if (vidTag) vidTag.style.display = 'none';
}
// ========================================================
// 6. MASTER TIMELINE ENGINE & SECURE POST MANAGEMENT
// ========================================================
function createPost() {
    const inputField = document.getElementById('future-input');
    if (!inputField) return;
    
    let textContent = inputField.value.trim();
    if (!textContent && !postAttachedMedia) {
        alert("Your future vision matrix is empty!");
        return;
    }
    
    // 🛡 Banned Keyword Cleansing Matrix
    let containsBanned = false;
    bannedKeywords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        if (regex.test(textContent)) {
            containsBanned = true;
            textContent = textContent.replace(regex, " [CLEANSED FROM TIMELINE] ");
        }
    });
    
    if (containsBanned) {
        alert("Warning: Contraband phrases detected and neutralized by the timeline monitor!");
    }
    
    const postObject = {
        id: "post_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        author: currentUser,
        text: textContent,
        media: postAttachedMedia,
        votes: {},
        voteCount: 0,
        comments: [],
        timestamp: Date.now()
    };
    
    if (!db) {
        alert("Database offline! Unable to sync timeline.");
        return;
    }
    
    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.add(postObject);
    
    request.onsuccess = () => {
        inputField.value = "";
        clearAttachedMedia();
        loadPostsFromDB();
    };
    
    request.onerror = (e) => {
        console.error("Timeline insertion failure:", e.target.error);
    };
}

function loadPostsFromDB() {
    if (!db) return;
    
    const transaction = db.transaction(["posts"], "readonly");
    const store = transaction.objectStore("posts");
    const request = store.getAll();
    
    request.onsuccess = (e) => {
        allPosts = e.target.result || [];
        
        // 📈 Advanced Timeline Ordering:
        // Prioritizes current user's posts first, then sorts remaining posts by newest timestamp
        allPosts.sort((a, b) => {
            if (a.author === currentUser && b.author !== currentUser) return -1;
            if (a.author !== currentUser && b.author === currentUser) return 1;
            return b.timestamp - a.timestamp;
        });
        
        searchPosts(); // Routes directly through the interface search pipeline
    };
}
// ========================================================
// 6.2 TIMELINE POST RENDERING ENGINE WITH SUBTLE INTERACTIONS
// ========================================================
function renderPosts(postsToRender) {
    const container = document.getElementById('feed-container');
    if (!container) return;
    container.innerHTML = "";

    if (postsToRender.length === 0) {
        container.innerHTML = `<div class='empty-timeline-state'>No visions found in this timeline coordinate.</div>`;
        return;
    }

    postsToRender.forEach(post => {
        const isLiked = post.votes && post.votes[currentUser] ? 'liked' : '';
        const savedAvatar = localStorage.getItem(`avatar_${post.author}`) || "avatar.png";
        const postDate = new Date(post.timestamp).toLocaleString();
        
        let mediaHtml = "";
        if (post.media) {
            if (post.media.type === 'image') {
                mediaHtml = `<div class="post-media-content"><img src="${post.media.url}"></div>`;
            } else if (post.media.type === 'video') {
                mediaHtml = `<div class="post-media-content"><video src="${post.media.url}" controls></video></div>`;
            }
        }

        // 💬 Build localized comments stream interface
        let commentsHtml = "";
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach((comment, idx) => {
                const commentLiked = comment.votes && comment.votes[currentUser] ? 'liked' : '';
                const commentLikesCount = comment.voteCount || 0;
                
                // Pure humble setup: Text-free layout for comments, metadata loaded via HTML titles natively
                commentsHtml += `
                    <div class="comment-node">
                        <strong>${comment.author}:</strong> <span class="comment-main-text">${comment.text}</span>
                        <div class="comment-meta-row">
                            <span class="comment-time">${new Date(comment.timestamp).toLocaleTimeString()}</span>
                            <button class="comment-vote-btn ${commentLiked}" 
                                    onclick="voteComment('${post.id}', ${idx})" 
                                    title="${translations[currentLanguage].prophecy_text}">
                                🔮 <span>${commentLikesCount}</span>
                            </button>
                        </div>
                    </div>`;
            });
        }

        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        // Pure humble setup: Removes text string 'Prophecy Verified' from button to keep dark/matrix design elegant.
        // Hover text reveals validation credentials via title parameter smoothly.
        postCard.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img src="${savedAvatar}" class="post-avatar-mini">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>${postDate}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <button class="vote-btn-neon ${isLiked}" onclick="votePost('${post.id}')" title="${translations[currentLanguage].prophecy_text}">
                        🔮 <span>${post.voteCount || 0}</span>
                    </button>
                    ${post.author === currentUser ? `<button class="post-more-btn" onclick="deletePost('${post.id}')" title="Delete Vision">✕</button>` : ''}
                </div>
            </div>
            <div class="post-main-text">${post.text}</div>
            ${mediaHtml}
            <div class="comments-section">
                <div class="comments-stream-box">${commentsHtml}</div>
                <div class="comment-input-row">
                    <input type="text" class="neural-comment-input-tag" data-post-id="${post.id}" placeholder="Write a comment..." data-i18n-placeholder="chat_input_placeholder">
                    <button class="comment-add-btn" onclick="addComment('${post.id}')">➔</button>
                </div>
            </div>
        `;
        container.appendChild(postCard);
    });
    
    applyLanguage(currentLanguage); // Runs translations check for dynamically injected tokens
}

function votePost(postId) {
    if (!db) return;
    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    
    store.get(postId).onsuccess = (e) => {
        const post = e.target.result;
        if (!post) return;
        
        if (!post.votes) post.votes = {};
        
        if (post.votes[currentUser]) {
            delete post.votes[currentUser];
        } else {
            post.votes[currentUser] = true;
        }
        
        post.voteCount = Object.keys(post.votes).length;
        
        store.put(post).onsuccess = () => {
            loadPostsFromDB();
        };
    };
}
// ========================================================
// 6.3 INTERACTIVE SUBTLE COMMENTS, TIMELINE DELETION & SEARCH
// ========================================================
// Handles text submission intercepts across interactive view nodes
document.addEventListener('keydown', (e) => {
    if (e.target && e.target.id === 'future-input' && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        createPost();
    }
    if (e.target && e.target.className === 'neural-comment-input-tag' && e.key === 'Enter') {
        e.preventDefault();
        addComment(e.target.getAttribute('data-post-id'));
    }
});

function addComment(postId) {
    const inputs = document.querySelectorAll(`.neural-comment-input-tag[data-post-id="${postId}"]`);
    if (inputs.length === 0) return;
    
    const commentInput = inputs[0];
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");

    store.get(postId).onsuccess = (e) => {
        const post = e.target.result;
        if (!post) return;

        if (!post.comments) post.comments = [];
        
        post.comments.push({
            author: currentUser,
            text: commentText,
            timestamp: Date.now(),
            votes: {},
            voteCount: 0
        });

        store.put(post).onsuccess = () => {
            commentInput.value = "";
            loadPostsFromDB();
        };
    };
}

function voteComment(postId, commentIdx) {
    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");

    store.get(postId).onsuccess = (e) => {
        const post = e.target.result;
        if (!post) return;

        const comment = post.comments[commentIdx];
        if (!comment) return;

        if (!comment.votes) comment.votes = {};

        if (comment.votes[currentUser]) {
            delete comment.votes[currentUser];
        } else {
            comment.votes[currentUser] = true;
        }

        comment.voteCount = Object.keys(comment.votes).length;

        store.put(post).onsuccess = () => {
            loadPostsFromDB();
        };
    };
}

function deletePost(postId) {
    if (!confirm("Are you certain you wish to eliminate this vision from the public timeline?")) return;
    
    const transaction = db.transaction(["posts"], "readwrite");
    const store = transaction.objectStore("posts");
    
    store.delete(postId).onsuccess = () => {
        loadPostsFromDB();
    };
}

function searchPosts() {
    const queryField = document.getElementById('search-input');
    const query = queryField ? queryField.value.toLowerCase().trim() : "";
    
    if (!query) {
        renderPosts(allPosts);
        return;
    }

    const filtered = allPosts.filter(post => {
        const textMatch = post.text.toLowerCase().includes(query);
        const authorMatch = post.author.toLowerCase().includes(query);
        
        let commentMatch = false;
        if (post.comments) {
            commentMatch = post.comments.some(c => c.text.toLowerCase().includes(query) || c.author.toLowerCase().includes(query));
        }
        
        return textMatch || authorMatch || commentMatch;
    });

    renderPosts(filtered);
}

// ========================================================
// 7. REAL-TIME CITIZENS MESSENGER ARCHITECTURE
// ========================================================
function loadOnlineCitizens() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;
    container.innerHTML = "";

    // Simulated network nodes list excluding current authenticated user
    const networkNodes = ["Alpha_Predictor", "Cyber_Seer", "Matrix_Dreamer", "Nexus_Citizen", "Sainaa34_G"];
    
    networkNodes.forEach(citizen => {
        if (citizen === currentUser) return;

        const isBlocked = blockedUsers[citizen] ? true : false;
        const blockText = isBlocked ? "Unblock" : "Block";
        const hasUnseen = unseenMessagesFrom[citizen] ? `<span class="unseen-mark">!</span>` : "";
        const savedAvatar = localStorage.getItem(`avatar_${citizen}`) || "avatar.png";
        const isActive = activeChatPartnerName === citizen ? "active" : "";

        const row = document.createElement('div');
        row.className = `friend-item-row ${isActive}`;
        row.onclick = () => selectChatPartner(citizen);

        row.innerHTML = `
            <div class="friend-user-meta-block">
                <img src="${savedAvatar}" class="friend-avatar-mini">
                <span>${citizen}</span>
                ${hasUnseen}
            </div>
            <button class="friend-block-btn" onclick="toggleBlockUser(event, '${citizen}')">${blockText}</button>
        `;
        container.appendChild(row);
    });
}

function toggleBlockUser(event, citizenName) {
    event.stopPropagation(); // Prevents selection firing triggers accidentally
    
    if (blockedUsers[citizenName]) {
        delete blockedUsers[citizenName];
    } else {
        blockedUsers[citizenName] = true;
        if (activeChatPartnerName === citizenName) {
            activeChatPartnerName = null;
            document.getElementById('active-chat-partner').textContent = translations[currentLanguage].select_chat_prompt;
            document.getElementById('friends-chat-messages').innerHTML = "";
        }
    }
    
    localStorage.setItem('iknow_blocked_users', JSON.stringify(blockedUsers));
    loadOnlineCitizens();
}

function selectChatPartner(citizenName) {
    if (blockedUsers[citizenName]) {
        alert("You cannot initiate a transmission with a blocked entity!");
        return;
    }
    
    activeChatPartnerName = citizenName;
    delete unseenMessagesFrom[citizenName];
    localStorage.setItem('iknow_unseen_msgs', JSON.stringify(unseenMessagesFrom));
    
    const chatHeader = document.getElementById('active-chat-partner');
    if (chatHeader) chatHeader.textContent = `💬 Secured Channel: ${citizenName}`;
    
    loadOnlineCitizens();
    loadFriendMessages();
}

function sendFriendMessage() {
    const input = document.getElementById('friends-chat-input');
    if (!input || !activeChatPartnerName) return;

    const text = input.value.trim();
    if (!text) return;

    const msgObject = {
        sender: currentUser,
        receiver: activeChatPartnerName,
        text: text,
        timestamp: Date.now()
    };

    const transaction = db.transaction(["messages"], "readwrite");
    const store = transaction.objectStore("messages");
    
    store.add(msgObject).onsuccess = () => {
        input.value = "";
        loadFriendMessages();
    };
}

function loadFriendMessages() {
    const stream = document.getElementById('friends-chat-messages');
    if (!stream || !activeChatPartnerName) return;
    stream.innerHTML = "";

    const transaction = db.transaction(["messages"], "readonly");
    const store = transaction.objectStore("messages");
    
    store.getAll().onsuccess = (e) => {
        const msgs = e.target.result || [];
        
        msgs.forEach(m => {
            // Filter stream matrix to matching dialogue coordinates exclusively
            const matchA = (m.sender === currentUser && m.receiver === activeChatPartnerName);
            const matchB = (m.sender === activeChatPartnerName && m.receiver === currentUser);
            
            if (matchA || matchB) {
                const bubble = document.createElement('div');
                bubble.className = (m.sender === currentUser) ? 'msg-row user' : 'msg-row friend-msg';
                bubble.textContent = m.text;
                stream.appendChild(bubble);
            }
        });
        
        stream.scrollTop = stream.scrollHeight; // Autoscroll focus to active bottom line
    };
}
// ========================================================
// 8. 🔒 SECURE PRIVATE VAULT TIMELINE LOG ENGINE
// ========================================================
function handleVaultImageSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        vaultAttachedImage = e.target.result;
        const previewBox = document.getElementById('vault-image-preview-box');
        const imgTag = document.getElementById('vault-img-preview-tag');
        
        if (previewBox) previewBox.style.display = 'block';
        if (imgTag) imgTag.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function clearVaultImageSelect() {
    vaultAttachedImage = null;
    const vaultFile = document.getElementById('vault-image-file');
    if (vaultFile) vaultFile.value = "";
    
    const previewBox = document.getElementById('vault-image-preview-box');
    if (previewBox) previewBox.style.display = 'none';
}

function saveVaultCalendar() {
    const dateInput = document.getElementById('vault-date-input');
    const textInput = document.getElementById('vault-calendar-text');
    if (!dateInput || !textInput) return;

    const dateVal = dateInput.value;
    const textVal = textInput.value.trim();

    if (!dateVal || (!textVal && !vaultAttachedImage)) {
        alert("Please select a timeline date coordinate and supply data to encrypt!");
        return;
    }

    const vaultObject = {
        id: "vault_" + dateVal + "_" + currentUser,
        user: currentUser,
        date: dateVal,
        text: textVal,
        image: vaultAttachedImage,
        timestamp: Date.now()
    };

    const transaction = db.transaction(["vault_calendar"], "readwrite");
    const store = transaction.objectStore("vault_calendar");
    
    store.put(vaultObject).onsuccess = () => {
        textInput.value = "";
        clearVaultImageSelect();
        loadVaultCalendarFromDB();
        alert("Memory successfully encrypted to your private vault block!");
    };
}

function loadVaultCalendarFromDB() {
    const list = document.getElementById('vault-calendar-list');
    if (!list || !db) return;
    list.innerHTML = "";

    const transaction = db.transaction(["vault_calendar"], "readonly");
    const store = transaction.objectStore("vault_calendar");
    
    store.getAll().onsuccess = (e) => {
        const records = e.target.result || [];
        
        // Filter vault logs to show only those belonging to the logged-in user
        const userRecords = records.filter(r => r.user === currentUser);
        userRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (userRecords.length === 0) {
            list.innerHTML = `<div class="empty-vault-state">Your private encryption vault is currently empty.</div>`;
            return;
        }

        userRecords.forEach(item => {
            const node = document.createElement('div');
            node.className = 'vault-item-node';
            
            let imageHtml = item.image ? `<div class="post-media-content" style="margin-top:10px;"><img src="${item.image}" style="max-height:200px;"></div>` : "";
            
            node.innerHTML = `
                <div style="display:flex; justify-content:between; align-items:center; margin-bottom:8px;">
                    <strong style="color:var(--accent-color);">${item.date}</strong>
                    <button class="post-more-btn" onclick="deleteVaultItem('${item.id}')" style="margin-left:auto;">✕</button>
                </div>
                <div style="font-size:0.95rem; white-space:pre-wrap;">${item.text}</div>
                ${imageHtml}
            `;
            list.appendChild(node);
        });
    };
}

function deleteVaultItem(id) {
    if (!confirm("Are you sure you want to permanently purge this encrypted log?")) return;
    
    const transaction = db.transaction(["vault_calendar"], "readwrite");
    const store = transaction.objectStore("vault_calendar");
    
    store.delete(id).onsuccess = () => {
        loadVaultCalendarFromDB();
    };
}

// ========================================================
// 9. 🎨 ARTIST AI SYSTEM LAYER (BIG TEXTAREA CONFIG)
// ========================================================
function generateAIImage() {
    const aiInput = document.getElementById('ai-prompt-input');
    const promptText = aiInput ? aiInput.value.trim() : "";
    
    if (!promptText) {
        alert("Please enter a vision prompt for the AI Artist!");
        return;
    }
    
    const aiResultContainer = document.getElementById('ai-image-result');
    if (aiResultContainer) {
        aiResultContainer.innerHTML = `<div style="color:var(--text-muted); margin-bottom:10px;">Neural network painting: "${promptText}"</div>
                                       <img src="https://picsum.photos{Date.now()}" style="border-radius:12px; border: 2px solid var(--border-color); max-width:100%; box-shadow:var(--shadow-md);">`;
    }
}

// ========================================================
// 10. 👤 PROFILE AVATAR MODAL MANAGEMENT (FIXED IDENTITY CRASH)
// ========================================================
function triggerAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    const previewImg = document.getElementById('modal-avatar-preview-tag');
    
    if (!modal) return;
    
    modalSelectedAvatarBase64 = null;
    const savedAvatar = localStorage.getItem(`avatar_${currentUser}`);
    
    if (previewImg) previewImg.src = savedAvatar || "avatar.png";
    modal.style.display = 'flex';
}

function closeAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal) modal.style.display = 'none';
}

function handleModalAvatarSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // 🛠 Safely extracts file array index elements directly
    const reader = new FileReader();
    reader.onload = (e) => {
        modalSelectedAvatarBase64 = e.target.result;
        const previewImg = document.getElementById('modal-avatar-preview-tag');
        if (previewImg) previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveModalAvatar() {
    // If no new image was selected, just dismiss the modal cleanly without overwriting data
    if (!modalSelectedAvatarBase64) {
        closeAvatarModal();
        return;
    }
    
    localStorage.setItem(`avatar_${currentUser}`, modalSelectedAvatarBase64);
    
    // Dynamically patch the main header session avatar view node right away
    const headerAvatar = document.getElementById('profile-avatar');
    if (headerAvatar) headerAvatar.src = modalSelectedAvatarBase64;
    
    alert("Neural identity profile avatar updated successfully!");
    closeAvatarModal();
    loadPostsFromDB(); // Re-renders timeline stream posts to map updated avatar icons everywhere
}
