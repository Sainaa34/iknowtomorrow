const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (Таг: #ai эсвэл асуулт: ?alien)",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...", send: "Илгээх", alert: "Зөгнөлөө бичнэ үү!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ", chatPlaceholder: "Мессеж бичих...",
        syncText: "🔮 Ой санамж сэргэлт", JustNow: "Дөнгөж сая", MinsAgo: "минутын өмнө", HoursAgo: "цагийн өмнө", DaysAgo: "хоногийн өмнө",
        friendsTitle: "👥 Ирээдүйн Хамтрагчид", addFriend: "➕ Хамтрагч нэмэх", unfriend: "❌ Хасах",
        editProfileBtn: "⚙️ Профайл Тохиргоог Засах", coverChangeLabel: "📷 Ковер Сэдэв Зургаа Солих",
        themeSelectLabel: "🎨 Сайтын үндсэн өнгө: ", globalSearchPlaceholder: "🔍 Хайх (Үг, таг эсвэл нэр...)",
        profileTitleText: "🔮 Ирээдүйг Зөгнөгч Магистр"
    },
    en: {
        placeholder: "What will happen in the future? Share here... (#ai or ?alien)",
        submit: "Post", commentPlaceholder: "Write a comment...", send: "Send", alert: "Please write valid content!",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ", chatPlaceholder: "Type a message...",
        syncText: "🔮 Memory Synced", JustNow: "Just now", MinsAgo: "mins ago", HoursAgo: "hours ago", DaysAgo: "days ago",
        friendsTitle: "👥 Future Companions", addFriend: "➕ Add Friend", unfriend: "❌ Unfriend",
        editProfileBtn: "⚙️ Edit Profile Settings", coverChangeLabel: "📷 Change Cover Theme",
        themeSelectLabel: "🎨 Main Site Color: ", globalSearchPlaceholder: "🔍 Search (Tag, keyword or name...)",
        profileTitleText: "🔮 Future Predicting Master"
    }
};

let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedMediaBase64 = "", attachedMediaType = "", selectedTagFilter = "", globalSearchQuery = "", messageCount = 0, isHeadacheMode = false, headacheTimeout = null;

const secretKeywords = ["2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"], bannedKeywords = ["porn", "порно", "секс", "sex", "казино", "casino", "мөрийтэй", "1xbet"], allAvailableTags = ["ai", "aliens", "dreams", "future", "technology"];

const initialFriends = [
    { id: "amaraa", name: "Amaraa [Cyber-Medic]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "zorigoo", name: "Zorigoo [Alien Hunter]", isFriend: false, avatar: "https://placeholder.com" }
];
// ЖИНХЭНЭ АККАУНТ СИСТЕМ (SIGN UP / LOGIN)
let currentUser = localStorage.getItem('iknow_current_user') || "";

function checkAuth() {
    if (!currentUser) {
        // Хэрэв нэвтрээгүй бол дэлгэцийг бүрэн хааж нэвтрэх цонх гаргана
        document.body.innerHTML = `
            <div style="background:#12161a; color:#fff; width:100vw; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Plus Jakarta Sans',sans-serif;">
                <div style="background:#1a1f26; border:1px solid #ffb703; padding:30px; border-radius:16px; box-shadow:0 0 20px rgba(255,183,3,0.15); width:320px; text-align:center;">
                    <h1 style="font-family:'Fredoka',cursive; color:#ffb703; margin:0 0 10px 0; font-size:1.8rem;">iknowtomorrow</h1>
                    <p style="font-size:0.85rem; color:#a0a5b0; margin-bottom:25px;">🔒 ИРЭЭДҮЙН ИРГЭНИЙ НЭВТРЭХ СҮЛЖЭЕ</p>
                    
                    <input type="text" id="authUsername" placeholder="Иргэний нэр (Username)" style="width:100%; padding:10px 15px; margin-bottom:12px; background:#12161a; border:1px solid #242b35; border-radius:8px; color:#fff; box-sizing:border-box; outline:none;">
                    <input type="password" id="authPassword" placeholder="Нууц үг (Password)" style="width:100%; padding:10px 15px; margin-bottom:20px; background:#12161a; border:1px solid #242b35; border-radius:8px; color:#fff; box-sizing:border-box; outline:none;">
                    
                    <button onclick="handleLogin()" style="width:100%; background:#ffb703; color:#000; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:10px;">НЭВТРЭХ / LOGIN</button>
                    <button onclick="handleSignUp()" style="width:100%; background:transparent; color:#ffb703; border:1px solid #ffb703; padding:11px; border-radius:8px; font-weight:bold; cursor:pointer;">ШИНЭЭР БҮРТГҮҮЛЭХ</button>
                </div>
            </div>`;
        return false;
    }
    return true;
}

function handleSignUp() {
    const u = document.getElementById('authUsername').value.trim();
    const p = document.getElementById('authPassword').value.trim();
    if(!u || !p) { alert("Нэр нууц үгээ оруулна уу, андаа!"); return; }
    
    let users = JSON.parse(localStorage.getItem('iknow_users_db')) || {};
    if(users[u]) { alert("Энэ нэр аль хэдийн бүртгэгдсэн байна!"); return; }
    
    users[u] = p;
    localStorage.setItem('iknow_users_db', JSON.stringify(users));
    alert("🎉 Амжилттай бүртгэгдлээ! Одоо нэвтрэх товчийг дараарай.");
}

function handleLogin() {
    const u = document.getElementById('authUsername').value.trim();
    const p = document.getElementById('authPassword').value.trim();
    let users = JSON.parse(localStorage.getItem('iknow_users_db')) || {"Sainaa": "1234"};
    
    if(users[u] && users[u] === p) {
        localStorage.setItem('iknow_current_user', u);
        location.reload(); // Хуудсыг шинэчилж нэвтрүүлнэ
    } else {
        alert("Нэр эсвэл нууц үг буруу байна, андаа!");
    }
}

function logoutAction() {
    localStorage.removeItem('iknow_current_user');
    location.reload();
}
document.addEventListener('DOMContentLoaded', () => {
    // Нэвтрэлт шалгах логик
    if (!checkAuth()) return;
    
    updateLanguageUI();
    loadPosts();
    loadChats();
    loadProfileAvatar();
    loadCoverTheme();
    loadFriends();
    updateSyncUI();
    loadOnlineStatus();
    loadCustomSiteTheme();
    
    // Системийн нэрийг нэвтэрсэн хэрэглэгчээр солих
    document.getElementById('sidebarName').innerText = currentUser;
    document.getElementById('profileName').innerText = currentUser;
    if(document.getElementById('currentUserLabel')) {
        document.getElementById('currentUserLabel').innerText = `👤 ${currentUser}`;
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
    currentLang = currentLang === 'mn' ? 'en' : 'mn';
    localStorage.setItem('iknow_lang', currentLang);
    updateLanguageUI();
    renderPosts();
    loadChats();
    updateSyncUI();
    if (document.getElementById('page-myposts').classList.contains('active')) {
        renderMyPosts();
    }
}

function updateLanguageUI() {
    const t = translations[currentLang];
    document.getElementById('langBtn').innerText = currentLang === 'mn' ? 'English' : 'Монгол';
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
    
    // 🔮 Ирээдүйг зөгнөгч магистрын үгийг орчуулгад бүрэн холбов!
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
        alert("🚨 Хууль бус контент нийтлэхийг хориглоно!");
        document.getElementById('postInput').value = '';
        return;
    }
    if(!content && !attachedMediaBase64) return;

    // Пост оруулахад user-ийг currentUser (нэвтэрсэн хүн) болгов!
    const newPost = { 
        id: Date.now(), 
        user: currentUser, 
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
    let isAlgorithmActive = posts.length > 10;

    posts.forEach(p => {
        let cc = p.content.toLowerCase();
        if (selectedTagFilter && !cc.includes('#' + selectedTagFilter) && !cc.includes('?' + selectedTagFilter)) return;
        if (globalSearchQuery && !cc.includes(globalSearchQuery) && !p.user.toLowerCase().includes(globalSearchQuery)) return;
        if (isAlgorithmActive && p.user !== currentUser && !friendNames.includes(p.user)) return;

        let comm = '';
        (p.comments || []).forEach(c => comm += `<div class="comment-item">${c}</div>`);
        let media = p.media ? (p.mediaType === 'image' ? `<img class="post-attached-img" src="${p.media}">` : `<video class="post-attached-img" src="${p.media}" controls></video>`) : '';

        if (!p.effects) p.effects = { fulfilled: 0, confirmed: 0, sight: 0 };
        let mc = Math.max(p.effects.fulfilled, p.effects.confirmed, p.effects.sight);
        let glow = mc >= 20 ? "effect-glow-legendary" : mc >= 10 ? "effect-glow-high" : mc >= 5 ? "effect-glow-medium" : "";
        let effIcon = p.effects.fulfilled >= Math.max(p.effects.confirmed, p.effects.sight) && p.effects.fulfilled > 0 ? `🔥 <span>${p.effects.fulfilled}</span>` : p.effects.confirmed >= Math.max(p.effects.fulfilled, p.effects.sight) && p.effects.confirmed > 0 ? `⚡ <span>${p.effects.confirmed}</span>` : p.effects.sight > 0 ? `👁️ <span>${p.effects.sight}</span>` : '';

        let userReactedLike = (p.reactions?.likes || []).includes(currentUser) ? "user-reacted" : "";
        let userReactedWow = (p.reactions?.wows || []).includes(currentUser) ? "user-reacted" : "";
        let userReactedOmg = (p.reactions?.omgs || []).includes(currentUser) ? "user-reacted" : "";

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
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${p.id}, 'sight')">👁️ <small>Ирээдүй харлаа</small></button>
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
        let arr = posts[idx].reactions[type] || [];
        if (arr.includes(currentUser)) {
            posts[idx].reactions[type] = arr.filter(u => u !== currentUser);
        } else {
            posts[idx].reactions.likes = (posts[idx].reactions.likes || []).filter(u => u !== currentUser);
            posts[idx].reactions.wows = (posts[idx].reactions.wows || []).filter(u => u !== currentUser);
            posts[idx].reactions.omgs = (posts[idx].reactions.omgs || []).filter(u => u !== currentUser);
            posts[idx].reactions[type].push(currentUser);
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
    posts.filter(p => p.user === currentUser).forEach(post => {
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
    if (idx !== -1) {
        posts[idx].comments.push(`${currentUser}: ${txt}`);
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
    
    if (!all[p]) all[p] = [];
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

function loadCustomSiteTheme() {
    applySiteCustomTheme();
}

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
