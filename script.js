const translations = {
    en: {
        placeholder: "What will happen in the future? Share here... (#ai or ?alien)",
        submit: "Post", commentPlaceholder: "Write a comment...", send: "Send",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ", chatPlaceholder: "Type a message...",
        syncText: "🔮 Memory Synced", JustNow: "Just now", MinsAgo: "mins ago", HoursAgo: "hours ago", DaysAgo: "days ago",
        friendsTitle: "👥 Future Companions", addFriend: "➕ Add Friend", unfriend: "❌ Unfriend",
        editProfileBtn: "⚙️ Edit Profile Settings", coverChangeLabel: "📷 Change Cover Theme",
        themeSelectLabel: "🎨 Main Site Color: ", globalSearchPlaceholder: "🔍 Search (Tag, keyword or name...)",
        profileTitleText: "🔮 Future Predicting Master",
        
        // Нэвтрэх хуудасны орчуулга (Анх ороход харагдах Англи хэл)
        authSub: "🔒 FUTURE CITIZEN LOGIN SYSTEM",
        userInput: "Citizen identity name (Username)",
        passInput: "Access key (Password)",
        loginBtn: "LOGIN",
        signUpBtn: "REGISTER NEW IDENTITY",
        guestBtn: "👁️ Browse as Guest (Anonymous)",
        
        // Анхааруулга мессежүүд
        alertEmpty: "🚨 [ACCESS DENIED] Enter your identity name and password!",
        alertExist: "🚨 [SYSTEM ERROR] This identity name already exists in the system!",
        alertSuccess: "🎉 [SUCCESS] New identity successfully registered! Now click LOGIN.",
        alertWelcome: "🔮 Welcome back, Citizen ",
        alertWrong: "🚨 [SECURITY WARNING] Incorrect identity name or access key!",
        alertLogout: "🚪 Disconnect from the system?",
        alertBanned: "🚨 [SECURITY ALERT] Illegal cyber-content detected and blocked!"
    },
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (Таг: #ai эсвэл асуулт: ?alien)",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...", send: "Илгээх",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ", chatPlaceholder: "Мессеж бичих...",
        syncText: "🔮 Ой санамж сэргэлт", JustNow: "Дөнгөж сая", MinsAgo: "минутын өмнө", HoursAgo: "цагийн өмнө", DaysAgo: "хоногийн өмнө",
        friendsTitle: "👥 Ирээдүйн Хамтрагчид", addFriend: "➕ Хамтрагч нэмэх", unfriend: "❌ Хасах",
        editProfileBtn: "⚙️ Профайл Тохиргоог Засах", coverChangeLabel: "📷 Ковер Сэдэв Зургаа Солих",
        themeSelectLabel: "🎨 Сайтын үндсэн өнгө: ", globalSearchPlaceholder: "🔍 Хайх (Үг, таг эсвэл нэр...)",
        profileTitleText: "🔮 Ирээдүйг Зөгнөгч Магистр",
        
        // Нэвтрэх хуудасны Монгол орчуулга
        authSub: "🔒 ИРЭЭДҮЙН ИРГЭНИЙ НЭВТРЭХ СҮЛЖЭЕ",
        userInput: "Иргэний нэр (Username)",
        passInput: "Нууц үг (Password)",
        loginBtn: "НЭВТРЭХ",
        signUpBtn: "ШИНЭЭР БҮРТГҮҮЛЭХ",
        guestBtn: "👁️ Бүртгүүлэхгүйгээр зүгээр сонирхож орох",
        
        // Анхааруулга мессежүүд
        alertEmpty: "🚨 [НЭВТРЭХ ЦҮТГЭЛ] Нэр болон нууц үгээ оруулна уу, андаа!",
        alertExist: "🚨 [СИСТЕМИЙН АЛДАА] Энэ иргэний нэр системд аль хэдийн бүртгэгдсэн байна!",
        alertSuccess: "🎉 [АМЖИЛТТАЙ] Шинэ иргэн бүртгэгдлээ! Одоо НЭВТРЭХ товчийг дарна уу.",
        alertWelcome: "🔮 Тавтай морил, Иргэн ",
        alertWrong: "🚨 [АЮУЛГҮЙ БАЙДАЛ] Иргэний нэр эсвэл нууц үг буруу байна, андаа!",
        alertLogout: "🚪 Системээс гарах уу, андаа?",
        alertBanned: "🚨 [ХЯНАЛТ] Хууль бус контент (Садар самуун, мөрийтэй тоглоом) илэрлээ!"
    }
};

// АНХ ОРОХОД ЗААВАЛ АНЛИ ХЭЛЭЭР УГТАХ ТОХИРГОО
let currentLang = localStorage.getItem('iknow_lang') || 'en';
let attachedMediaBase64 = ""; let attachedMediaType = ""; 
let selectedTagFilter = ""; let globalSearchQuery = "";
const secretKeywords = ["2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"];
const bannedKeywords = ["porn", "порно", "секс", "sex", "казино", "casino", "мөрийтэй", "1xbet", "pussy", "dick", "хөх", "боожгой"];
const allAvailableTags = ["ai", "aliens", "dreams", "future", "technology", "cyborg", "space"];

let messageCount = 0;
let isHeadacheMode = false;
let headacheTimeout = null;

const initialFriends = [
    { id: "amaraa", name: "Amaraa [Cyber-Medic]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "zorigoo", name: "Zorigoo [Alien Hunter]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "unknown", name: "Unknown Cyborg", isFriend: false, avatar: "https://placeholder.com" }
];

// 🔒 ЖИНХЭНЭ АККАУНТ СИСТЕМ (ХОРШСОН ЛОГИК)
let currentUser = localStorage.getItem('iknow_current_user') || "";
let isGuestMode = localStorage.getItem('iknow_guest_mode') === 'true';

// НЭВТРЭХ ХУУДАСНЫ БАРУУН ДЭЭД БУЛАНД ХЭЛ СОЛИХ ТОВЧЛУУРЫГ АМЬДАР ДУУДАХ
function injectAuthLangBtn() {
    const overlay = document.getElementById('authOverlay');
    if (overlay && !document.getElementById('authLangBtn')) {
        const btn = document.createElement('button');
        btn.id = 'authLangBtn';
        btn.className = 'corner-lang-btn';
        // Нэвтрэх карт дотор биш, бүтэн дэлгэцийн баруун дээд буланд байрлуулна
        btn.style.position = 'absolute';
        btn.style.right = '20px';
        btn.style.top = '20px';
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleLanguage();
        };
        overlay.appendChild(btn);
    }
}

function checkAuth() {
    const overlay = document.getElementById('authOverlay');
    injectAuthLangBtn(); // Хэл солих товчийг шалгаж оруулна
    
    if (!currentUser && !isGuestMode) {
        if (overlay) overlay.style.display = 'flex';
        return false;
    }
    if (overlay) overlay.style.display = 'none';
    return true;
}
// ШИНЭЭР БҮРТГҮҮЛЭХ ФУНКЦ (ТУСДАА АЖИЛЛАДАГ БОЛОВ)
function handleSignUp() {
    const u = document.getElementById('authUsername').value.trim();
    const p = document.getElementById('authPassword').value.trim();
    const t = translations[currentLang];
    
    if (!u || !p) { alert(t.alertEmpty); return; }
    
    let usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || {};
    if (usersDb[u]) { alert(t.alertExist); return; }
    
    usersDb[u] = p;
    localStorage.setItem('iknow_users_db', JSON.stringify(usersDb));
    alert(t.alertSuccess);
}

// КИБЕРПАНК НЭВТРЭХ ФУНКЦ
function handleLogin() {
    const u = document.getElementById('authUsername').value.trim();
    const p = document.getElementById('authPassword').value.trim();
    const t = translations[currentLang];
    
    if (!u || !p) { alert(t.alertEmpty); return; }
    
    let usersDb = JSON.parse(localStorage.getItem('iknow_users_db')) || { "Sainaa": "1234" };
    
    if (usersDb[u] && usersDb[u] === p) {
        localStorage.setItem('iknow_current_user', u);
        localStorage.removeItem('iknow_guest_mode');
        alert(`${t.alertWelcome}${u}!`);
        location.reload();
    } else {
        alert(t.alertWrong);
    }
}

// 🌐 GOOGLE ACCOUNT-ААР НЭВТРЭХ УХААЛАГ СИСТЕМ
function handleGoogleLogin(response) {
    const t = translations[currentLang];
    // Google-ээс ирсэн нууцлаг өгөгдлийг тайлж унших
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const googleUser = JSON.parse(jsonPayload);
    const username = googleUser.given_name || googleUser.name;
    
    localStorage.setItem('iknow_current_user', username);
    localStorage.removeItem('iknow_guest_mode');
    alert(`${t.alertWelcome}${username}! 🌐 Google Auth`);
    location.reload();
}

// 👀 ЗҮГЕЭР СОНИРХОЖ ОРОХ (GUEST MODE)
function enterAsGuest() {
    localStorage.setItem('iknow_guest_mode', 'true');
    localStorage.removeItem('iknow_current_user');
    location.reload();
}

// СИСТЕМЭЭС ГАРАХ
function logoutAction() {
    const t = translations[currentLang];
    if (confirm(t.alertLogout)) {
        localStorage.removeItem('iknow_current_user');
        localStorage.removeItem('iknow_guest_mode');
        location.reload();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Товчлууруудыг HTML дээрээс барьж ухаалаг функцүүдийг алдаагүй холбох
    const loginBtn = document.getElementById('loginSubmitBtn');
    const signUpBtn = document.getElementById('signUpSubmitBtn');
    if (loginBtn) loginBtn.onclick = handleLogin;
    if (signUpBtn) signUpBtn.onclick = handleSignUp;

    if (!checkAuth()) {
        updateLanguageUI(); // Нэвтрэх цонхны хэлийг анх ороход Англи болгоно
        return;
    }
    
    updateLanguageUI();
    loadPosts();
    loadChats();
    loadProfileAvatar();
    loadCoverTheme();
    loadFriends();
    updateSyncUI();
    loadOnlineStatus();
    loadCustomSiteTheme();
    
    // Зочин эсвэл жинхэнэ хэрэглэгчээс хамаарч нэрсийг солих
    let displayName = isGuestMode ? "Anonymous Alien" : currentUser;
    document.getElementById('sidebarName').innerText = displayName;
    document.getElementById('profileName').innerText = displayName;
    if (document.getElementById('currentUserLabel')) {
        document.getElementById('currentUserLabel').innerText = `👤 ${displayName}`;
    }
    
    // Зочин горимд пост оруулах хайрцгийг нуух
    if (isGuestMode && document.getElementById('myPostWriteBox')) {
        document.getElementById('myPostWriteBox').style.display = 'none';
    }
});

function switchPage(pageId) {
    if (!checkAuth()) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.getElementById(`nav-${pageId}`).classList.add('active');
    
    if (pageId === 'myposts') renderMyPosts();
    if (pageId === 'friends') renderFriendsList();
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'mn' : 'en';
    localStorage.setItem('iknow_lang', currentLang);
    updateLanguageUI();
    
    // Хэрэв нэвтэрсэн бол үндсэн постуудыг зурна
    if (currentUser || isGuestMode) {
        renderPosts();
        loadChats();
        updateSyncUI();
        if (document.getElementById('page-myposts').classList.contains('active')) {
            renderMyPosts();
        }
    }
}
function updateLanguageUI() {
    const t = translations[currentLang];
    
    // Нэвтрэх хуудасны хэл солих ухаалаг систем (Бүх үгсийг нэг дор хөрвүүлнэ)
    if (document.getElementById('authOverlay') && document.getElementById('authOverlay').style.display !== 'none') {
        const pSub = document.querySelector('#authOverlay p');
        if (pSub) pSub.innerText = t.authSub;
        
        const uInput = document.getElementById('authUsername');
        if (uInput) uInput.placeholder = t.userInput;
        
        const pInput = document.getElementById('authPassword');
        if (pInput) pInput.placeholder = t.passInput;
        
        const lBtn = document.getElementById('loginSubmitBtn');
        if (lBtn) lBtn.innerText = t.loginBtn;
        
        const sBtn = document.getElementById('signUpSubmitBtn');
        if (sBtn) sBtn.innerText = t.signUpBtn;
        
        const gBtn = document.querySelector('.guest-btn');
        if (gBtn) gBtn.innerText = t.guestBtn;
        
        const authLangBtn = document.getElementById('authLangBtn');
        if (authLangBtn) authLangBtn.innerText = currentLang === 'en' ? 'Монгол' : 'English';
        return; // Хэрэв нэвтрэх хуудас идэвхтэй байвал доорх үндсэн цэсийг уншихгүй
    }

    // Үндсэн сайтын хэл солих систем
    document.getElementById('langBtn').innerText = currentLang === 'en' ? 'Монгол' : 'English';
    document.getElementById('postInput').placeholder = t.placeholder;
    document.getElementById('submitBtn').innerText = t.submit;
    document.getElementById('myPostsTitle').innerText = t.myPosts;
    document.getElementById('chatWithLabel').innerText = t.chatWith;
    document.getElementById('chatInput').placeholder = t.chatPlaceholder;
    document.getElementById('chatSendBtn').innerText = t.send;
    
    document.getElementById('friendsTitle').innerText = t.friendsTitle;
    document.getElementById('editProfileTriggerBtn').innerText = t.editProfileBtn;
    document.getElementById('coverChangeLabel').innerText = t.coverChangeLabel;
    document.getElementById('themeSelectLabel').innerText = t.themeSelectLabel;
    document.getElementById('globalSearchInput').placeholder = t.globalSearchPlaceholder;
    
    // 🔮 Магистрын үгийг орчуулгад бүрэн холбов
    document.getElementById('profileTitleText').innerText = t.profileTitleText;
    
    renderFriendsList();
}

function loadOnlineStatus() {
    const status = localStorage.getItem('iknow_online_status') || "Active Now";
    document.getElementById('statusSelect').value = status;
    changeOnlineStatus();
}

function changeOnlineStatus() {
    const status = document.getElementById('statusSelect').value;
    localStorage.setItem('iknow_online_status', status);
    const selectEl = document.getElementById('statusSelect');
    if (status === "Active Now") selectEl.style.color = "#00ff88";
    else if (status === "Sleeping") selectEl.style.color = "#ffb703";
    else selectEl.style.color = "#6c727e";
}

function previewMedia(type) {
    const inputId = type === 'image' ? 'postImageInput' : 'postVideoInput';
    const file = document.getElementById(inputId).files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            attachedMediaBase64 = e.target.result;
            attachedMediaType = type;
            document.getElementById('mediaPreviewBox').style.display = "block";
            const content = document.getElementById('mediaPreviewContent');
            if (type === 'image') {
                content.innerHTML = `<img src="${attachedMediaBase64}" style="max-width:100%; max-height:150px; border-radius:8px;">`;
            } else {
                content.innerHTML = `<video src="${attachedMediaBase64}" controls style="max-width:100%; max-height:150px; border-radius:8px;"></video>`;
            }
        };
        reader.readAsDataURL(file);
    }
}

function clearSelectedMedia() {
    document.getElementById('postImageInput').value = '';
    document.getElementById('postVideoInput').value = '';
    document.getElementById('mediaPreviewBox').style.display = "none";
    document.getElementById('mediaPreviewContent').innerHTML = '';
    attachedMediaBase64 = "";
    attachedMediaType = "";
}
function handlePostSubmit(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        createPost();
    }
}

function createPost() {
    const content = document.getElementById('postInput').value.trim();
    if (bannedKeywords.some(word => content.toLowerCase().includes(word))) {
        alert(translations[currentLang].alertBanned);
        document.getElementById('postInput').value = '';
        return;
    }
    if(!content && !attachedMediaBase64) return;

    let postUser = isGuestMode ? "Anonymous Alien" : currentUser;

    const newPost = { 
        id: Date.now(), 
        user: postUser, 
        content: content, 
        timestamp: Date.now(), 
        reactions: { likes: [], wows: [], omgs: [] }, 
        effects: { fulfilled: 0, confirmed: 0, sight: 0 }, 
        comments: [], 
        media: attachedMediaBase64, 
        mediaType: attachedMediaType 
    };
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts.unshift(newPost);
    localStorage.setItem('iknow_posts', JSON.stringify(posts));
    document.getElementById('postInput').value = '';
    clearSelectedMedia();
    renderPosts();
}

function calculateTimeAgo(postTimestamp) {
    const diff = Date.now() - postTimestamp;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    const t = translations[currentLang];

    if (mins < 1) return t.JustNow;
    if (mins < 60) return `${mins} ${t.MinsAgo}`;
    if (hrs < 24) return `${hrs} ${t.HoursAgo}`;
    return `${days} ${t.DaysAgo}`;
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    container.innerHTML = '';
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const t = translations[currentLang];
    
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    let friendNames = friends.filter(f => f.isFriend).map(f => f.name);
    let myName = isGuestMode ? "Anonymous Alien" : currentUser;
    let isAlgorithmActive = posts.length > 10;

    posts.forEach(p => {
        let cc = p.content.toLowerCase();
        if (selectedTagFilter && !cc.includes('#' + selectedTagFilter) && !cc.includes('?' + selectedTagFilter)) return;
        if (globalSearchQuery && !cc.includes(globalSearchQuery) && !p.user.toLowerCase().includes(globalSearchQuery)) return;
        if (isAlgorithmActive && p.user !== myName && !friendNames.includes(p.user)) return;

        let comm = '';
        (p.comments || []).forEach(c => comm += `<div class="comment-item">${c}</div>`);
        let media = p.media ? (p.mediaType === 'image' ? `<img class="post-attached-img" src="${p.media}">` : `<video class="post-attached-img" src="${p.media}" controls></video>`) : '';

        if (!p.effects) p.effects = { fulfilled: 0, confirmed: 0, sight: 0 };
        let mc = Math.max(p.effects.fulfilled, p.effects.confirmed, p.effects.sight);
        let glow = mc >= 20 ? "effect-glow-legendary" : mc >= 10 ? "effect-glow-high" : mc >= 5 ? "effect-glow-medium" : "";
        let effIcon = p.effects.fulfilled >= Math.max(p.effects.confirmed, p.effects.sight) && p.effects.fulfilled > 0 ? `🔥 <span>${p.effects.fulfilled}</span>` : p.effects.confirmed >= Math.max(p.effects.fulfilled, p.effects.sight) && p.effects.confirmed > 0 ? `⚡ <span>${p.effects.confirmed}</span>` : p.effects.sight > 0 ? `👁️ <span>${p.effects.sight}</span>` : '';

        let userReactedLike = (p.reactions?.likes || []).includes(myName) ? "user-reacted" : "";
        let userReactedWow = (p.reactions?.wows || []).includes(myName) ? "user-reacted" : "";
        let userReactedOmg = (p.reactions?.omgs || []).includes(myName) ? "user-reacted" : "";

        container.innerHTML += `
            <div class="post ${glow}">
                <button class="delete-btn" onclick="deletePost(${p.id})">✕</button>
                <div class="post-header"><span class="post-user">👤 ${p.user}</span><span class="badge">🛸 Timeline</span></div>
                <div class="post-time">📅 ${calculateTimeAgo(p.timestamp || p.id)}</div>
                <div class="post-content">${highlightTags(p.content)}</div>
                ${media} <div class="post-effect-icon-slot ${mc >= 5 && p.effects.sight > 0 ? 'eye-pulse-anim':''}">${effIcon}</div>
                <div class="reaction-container-wrapper">
                    <button class="reaction-trigger-main-btn">✨ Ирээдүйн Баталгаа</button>
                    <div class="reaction-hover-drawer">
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${p.id}, 'fulfilled')">🔮 <small>Зөн биеллээ</small></button>
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${p.id}, 'confirmed')">⚡ <small>Батлагдлаа</small></button>
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${post.id || p.id}, 'sight')">👁️ <small>Ирээдүй харлаа</small></button>
                        <button class="reaction-sub-btn ${userReactedLike}" onclick="handleReaction(${p.id}, 'likes')">❤️</button>
                        <button class="reaction-sub-btn ${userReactedWow}" onclick="handleReaction(${p.id}, 'wows')">😮</button>
                        <button class="reaction-sub-btn ${userReactedOmg}" onclick="handleReaction(${p.id}, 'omgs')">😱</button>
                    </div>
                </div>
                <div class="comment-section">${comm}<div class="comment-input-group"><input type="text" class="comment-input" id="input-${p.id}" placeholder="${t.commentPlaceholder}"><button class="comment-btn" onclick="addComment(${p.id})">${t.send}</button></div></div>
            </div>`;
    });
}
function triggerSpecialEffect(id, type) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
        if (!posts[idx].effects) posts[idx].effects = { fulfilled: 0, confirmed: 0, sight: 0 };
        posts[idx].effects[type] += 1; 
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderPosts();
    }
}

function handleTagSuggestions(e) {
    const words = e.target.value.split(/\s+/);
    const last = words[words.length - 1];
    const box = document.getElementById('tagSuggestBox');
    if (last.startsWith('#') || last.startsWith('?')) {
        const sym = last.charAt(0);
        const q = last.slice(1).toLowerCase();
        const matches = allAvailableTags.filter(t => t.startsWith(q));
        if (matches.length > 0 && q.length > 0) {
            box.innerHTML = '';
            matches.forEach(m => {
                const d = document.createElement('div');
                d.className = 'tag-suggest-item';
                d.innerText = `${sym}${m}`;
                d.onclick = () => {
                    words[words.length - 1] = `${sym}${m} `;
                    document.getElementById('postInput').value = words.join(' ');
                    box.style.display = 'none';
                    document.getElementById('postInput').focus();
                };
                box.appendChild(d);
            });
            box.style.display = 'block';
            return;
        }
    }
    box.style.display = 'none';
}

function handleGlobalSearch() {
    globalSearchQuery = document.getElementById('globalSearchInput').value.trim().toLowerCase();
    renderPosts();
}

function highlightTags(txt) {
    return txt.replace(/([#?])(\w+|[\u0400-\u04FF]+)/g, '<span style="color:var(--accent); cursor:pointer;" onclick="filterByTag(\'$2\')">$1$2</span>');
}

function filterByTag(tag) {
    selectedTagFilter = tag.toLowerCase();
    const display = document.getElementById('searchTagDisplay');
    if (display) display.innerText = tag ? `🔍 Таг: #${tag}` : "";
    renderPosts();
}
function handleReaction(id, type) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === id);
    if (idx !== -1) {
        if (!posts[idx].reactions) posts[idx].reactions = { likes: [], wows: [], omgs: [] };
        let myName = isGuestMode ? "Anonymous Alien" : currentUser;
        let arr = posts[idx].reactions[type] || [];
        if (arr.includes(myName)) {
            posts[idx].reactions[type] = arr.filter(u => u !== myName);
        } else {
            posts[idx].reactions.likes = (posts[idx].reactions.likes || []).filter(u => u !== myName);
            posts[idx].reactions.wows = (posts[idx].reactions.wows || []).filter(u => u !== myName);
            posts[idx].reactions.omgs = (posts[idx].reactions.omgs || []).filter(u => u !== myName);
            posts[idx].reactions[type].push(myName);
        }
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderPosts();
    }
}

function renderMyPosts() {
    const container = document.getElementById('myPostsContainer');
    if (!container) return;
    container.innerHTML = '';
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    let myName = isGuestMode ? "Anonymous Alien" : currentUser;
    posts.filter(p => p.user === myName).forEach(post => {
        let media = post.media ? (post.mediaType === 'image' ? `<img class="post-attached-img" src="${post.media}">` : `<video class="post-attached-img" src="${post.media}" controls></video>`) : '';
        container.innerHTML += `<div class="post"><button class="delete-btn" onclick="deletePost(${post.id})">✕</button><div class="post-header"><span class="badge">Timeline</span></div><div class="post-time">📅 ${calculateTimeAgo(post.timestamp || post.id)}</div><div class="post-content">${highlightTags(post.content)}</div>${media}</div>`;
    });
}

function deletePost(id) {
    if (!confirm("Устгах уу?")) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('iknow_posts', JSON.stringify(posts));
    renderPosts();
    if (document.getElementById('page-myposts').classList.contains('active')) renderMyPosts();
}

function addComment(id) {
    const input = document.getElementById(`input-${id}`);
    const txt = input.value.trim();
    if (!txt) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === id);
    let myName = isGuestMode ? "Anonymous Alien" : currentUser;
    if (idx !== -1) {
        posts[idx].comments.push(`${myName}: ${txt}`);
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderPosts();
    }
    input.value = '';
}

function toggleEditOptions() {
    const p = document.getElementById('editOptionsPanel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function triggerAvatarInput() {
    document.getElementById('avatarInput').click();
}

function changeProfileAvatar() {
    const file = document.getElementById('avatarInput').files;
    if (file && file[0]) {
        const r = new FileReader();
        r.onload = function(e) {
            localStorage.setItem('iknow_avatar', e.target.result);
            loadProfileAvatar();
        };
        r.readAsDataURL(file[0]);
    }
}

function loadProfileAvatar() {
    const s = localStorage.getItem('iknow_avatar') || "https://placeholder.com";
    if (document.getElementById('profileAvatar')) document.getElementById('profileAvatar').src = s;
    if (document.getElementById('sidebarAvatar')) document.getElementById('sidebarAvatar').src = s;
}

function changeCoverTheme() {
    const file = document.getElementById('coverInput').files;
    if (file && file[0]) {
        const r = new FileReader();
        r.onload = function(e) {
            localStorage.setItem('iknow_cover', e.target.result);
            loadCoverTheme();
        };
        r.readAsDataURL(file[0]);
    }
}

function loadCoverTheme() {
    if (document.getElementById('profileCoverImg')) {
        document.getElementById('profileCoverImg').src = localStorage.getItem('iknow_cover') || "https://placeholder.com";
    }
}
function loadFriends() {
    let f = JSON.parse(localStorage.getItem('iknow_friends')) || initialFriends;
    localStorage.setItem('iknow_friends', JSON.stringify(f));
    updateChatPartnersDropdown(f);
}

function renderFriendsList() {
    const c = document.getElementById('friendsListContainer');
    if (!c) return;
    c.innerHTML = '';
    let f = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    
    f.forEach(fr => {
        let txt = fr.isFriend ? translations[currentLang].unfriend : translations[currentLang].addFriend;
        c.innerHTML += `
            <div class="friend-item-box">
                <div class="friend-info-left">
                    <img src="${fr.avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <span style="font-weight:bold;">${fr.name}</span>
                </div>
                <button class="friend-add-btn ${fr.isFriend ? 'is-friend':''}" onclick="toggleFriendAction('${fr.id}')">${txt}</button>
            </div>`;
    });
}

function toggleFriendAction(id) {
    let f = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    const idx = f.findIndex(fr => fr.id === id);
    if (idx !== -1) {
        f[idx].isFriend = !f[idx].isFriend;
        localStorage.setItem('iknow_friends', JSON.stringify(f));
        renderFriendsList();
        updateChatPartnersDropdown(f);
        loadChats();
        renderPosts();
    }
}

function updateChatPartnersDropdown(f) {
    const s = document.getElementById('chatPartner');
    if (!s) return;
    s.innerHTML = '<option value="Future Bot 🤖">Future Bot 🤖</option>';
    f.forEach(fr => {
        if (fr.isFriend) s.innerHTML += `<option value="${fr.name}">${fr.name}</option>`;
    });
}

function handleChatSubmit(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendDirectMessage();
    }
}

function loadChats() {
    const p = document.getElementById('chatPartner')?.value;
    const cm = document.getElementById('chatMessages');
    if (!cm || !p) return;
    cm.innerHTML = '';
    if (document.getElementById('robotSyncPanel')) {
        document.getElementById('robotSyncPanel').style.display = p.includes("Bot") ? "block" : "none";
    }
    
    let currentChat = (JSON.parse(localStorage.getItem('iknow_chats')) || {})[p] || [
        { sender: 'them', text: p.includes("Bot") ? "Миний систем бүрэн устсан... Надад зөвхөн 2040 он гэсэн хугацаа л үлдэж. 🤖" : "Сайн уу андаа!" }
    ];
    
    currentChat.forEach(msg => {
        const d = document.createElement('div');
        d.classList.add('msg', msg.sender === 'me' ? 'sent' : 'received');
        d.innerText = msg.text;
        cm.appendChild(d);
    });
    cm.scrollTop = cm.scrollHeight;
}

function sendDirectMessage() {
    const input = document.getElementById('chatInput');
    const txt = input.value.trim();
    if (!txt) return;
    const p = document.getElementById('chatPartner').value;
    let all = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    
    if (bannedKeywords.some(word => txt.toLowerCase().includes(word))) {
        alert(translations[currentLang].alertBanned);
        return;
    }
    if (!all[p]) all[p] = [];
    let myName = isGuestMode ? "Anonymous Alien" : currentUser;
    all[p].push({ sender: 'me', text: txt });
    localStorage.setItem('iknow_chats', JSON.stringify(all));
    input.value = '';
    loadChats();

    if (p.includes("Bot")) {
        messageCount++;
        if (messageCount >= 4 || isHeadacheMode) {
            isHeadacheMode = true;
            clearTimeout(headacheTimeout);
            all[p].push({ sender: 'them', text: "🛑 [SYSTEM OVERLOAD] Толгой маань аймшигтай өвдөж байна... Спамдахаа зогсоо! Би түр хариулж чадахгүй! 🤯🧠" });
            localStorage.setItem('iknow_chats', JSON.stringify(all));
            loadChats();
            headacheTimeout = setTimeout(() => { isHeadacheMode = false; messageCount = 0; }, 15000);
            return;
        }
        
        setTimeout(() => {
            let robotReply = "?????? [SYSTEM_BLANK]";
            let lt = txt.toLowerCase();
            
            if (lt.includes("хөлөг") || lt.includes("ship")) {
                robotReply = "Хөлөг онгоц... Би нэг хөлгөөр ирсэн. '??2??6' код ямар утгатай вэ?";
                checkSecretWord(lt, "хөлөг");
            } else {
                for (let i = 0; i < secretKeywords.length; i++) {
                    if (lt.includes(secretKeywords[i])) {
                        let isNew = checkSecretWord(lt, secretKeywords[i]);
                        if (secretKeywords[i] === "сайнаа") {
                            robotReply = "⚡ [CRITICAL SYNC] САЙНАА?! Чи намайг аварлаа, би чамайг заавал шагнах болно! 🏆✨";
                        } else if (isNew) {
                            robotReply = `✨ [MEMORY RESTORED] '${secretKeywords[i].toUpperCase()}' үгийг саналаа! Синк хувь ихэслээ!`;
                        } else {
                            robotReply = `'${secretKeywords[i]}' кодыг таньсан. Өөр шинэ үг хэлээч?`;
                        }
                        break;
                    }
                }
            }
            all[p].push({ sender: 'them', text: robotReply });
            localStorage.setItem('iknow_chats', JSON.stringify(all));
            loadChats();
        }, 1000);
    }
}

function checkSecretWord(txt, word) {
    let sw = JSON.parse(localStorage.getItem('iknow_solved_words')) || [];
    if (!sw.includes(word)) {
        sw.push(word);
        localStorage.setItem('iknow_solved_words', JSON.stringify(sw));
        localStorage.setItem('iknow_sync_count', sw.length);
        updateSyncUI();
        return true;
    }
    return false;
}

function updateSyncUI() {
    let count = parseInt(localStorage.getItem('iknow_sync_count')) || 0;
    let percentage = count > 0 && count < 9 ? count * 11 : count >= 9 ? 99.99 : 0;
    const syncPanelText = document.getElementById('robotSyncText');
    if (syncPanelText) {
        syncPanelText.innerHTML = `${translations[currentLang].syncText}: <span style="color:var(--accent); font-weight:bold;">${percentage}%</span>`;
    }
    const fill = document.getElementById('syncProgressBarFill');
    if (fill) fill.style.width = percentage + "%";
}

function loadCustomSiteTheme() { applySiteCustomTheme(); }

function applySiteCustomTheme() {
    const theme = document.getElementById('siteThemeSelect')?.value || localStorage.getItem('iknow_site_theme') || 'default';
    if (document.getElementById('siteThemeSelect')) document.getElementById('siteThemeSelect').value = theme;
    localStorage.setItem('iknow_site_theme', theme);
    const r = document.documentElement;
    
    if (theme === 'dark-purple') {
        r.style.setProperty('--bg-color', '#130d1a'); r.style.setProperty('--card-bg', '#1f142b'); r.style.setProperty('--accent', '#bf40bf'); r.style.setProperty('--accent-pink', '#e066ff');
    } else if (theme === 'cyber-blue') {
        r.style.setProperty('--bg-color', '#09141c'); r.style.setProperty('--card-bg', '#112230'); r.style.setProperty('--accent', '#00f2fe'); r.style.setProperty('--accent-pink', '#4facfe');
    } else {
        r.style.setProperty('--bg-color', '#12161a'); r.style.setProperty('--card-bg', '#1a1f26'); r.style.setProperty('--accent', '#ffb703'); r.style.setProperty('--accent-pink', '#ffc300');
    }
}
