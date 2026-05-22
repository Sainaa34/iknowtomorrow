const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (#ai эсвэл ?alien)",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...",
        send: "Илгээх", alert: "Зөгнөлөө бичнэ үү, андаа!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ",
        chatPlaceholder: "Мессеж бичих...",
        robotSync: "🔮 Роботын ой санамж сэргэлт: ",
        justNow: "Дөнгөж сая", today: "Өнөөдөр", minutesAgo: " минутын өмнө", daysAgo: " өдрийн өмнө",
        categories: ["🤖 AI", "🚀 Технологи", "🔮 Зүүд", "👽 Харь гариг", "🦾 Киборг"]
    },
    en: {
        placeholder: "What will happen in the future? Share here... (#ai or ?alien)",
        submit: "Post", commentPlaceholder: "Write a comment...",
        send: "Send", alert: "Please write valid content!",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ",
        chatPlaceholder: "Type a message...",
        robotSync: "🔮 Robot Memory Sync: ",
        justNow: "Just now", today: "Today", minutesAgo: "m ago", daysAgo: "d ago",
        categories: ["🤖 AI", "🚀 Technology", "🔮 Dreams", "👽 Aliens", "🦾 Cyborg"]
    }
};

let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedMediaBase64 = ""; let attachedMediaType = ""; let selectedTagFilter = "";

const secretKeywords = ["2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"];
const bannedKeywords = ["porn", "порно", "секс", "sex", "казино", "casino", "мөрийтэй", "1xbet"];

let messageCount = 0; let isHeadacheMode = false; let headacheTimeout = null;

const initialFriends = [
    { id: "amaraa", name: "Amaraa [Cyber-Medic]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "zorigoo", name: "Zorigoo [Alien Hunter]", isFriend: false, avatar: "https://placeholder.com" }
];

document.addEventListener('DOMContentLoaded', () => {
    loadCyberTheme(); updateLanguageUI(); loadPosts(); loadChats(); loadProfileAvatar(); loadCoverTheme(); loadFriends(); updateSyncUI(); loadOnlineStatus();
});

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.getElementById(`nav-${pageId}`).classList.add('active');
    if(pageId === 'myposts') renderMyPosts();
    if(pageId === 'friends') renderFriendsList();
}

function toggleLanguage() {
    currentLang = currentLang === 'mn' ? 'en' : 'mn'; localStorage.setItem('iknow_lang', currentLang);
    updateLanguageUI(); renderPosts(); loadChats();
    if(document.getElementById('page-myposts').classList.contains('active')) renderMyPosts();
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
    updateSyncUI();
}

// DOTA 2 СТИЛИЙН БҮРЭН ТӨРӨЛ ӨНГӨ СОЛИГЧ (THEME SELECTOR)
function setCyberTheme(mainColor, subColor) {
    localStorage.setItem('cyber_main', mainColor); localStorage.setItem('cyber_sub', subColor);
    loadCyberTheme();
}
function loadCyberTheme() {
    let main = localStorage.getItem('cyber_main') || '#ffb703';
    let sub = localStorage.getItem('cyber_sub') || '#ffc300';
    document.documentElement.style.setProperty('--accent', main);
    document.documentElement.style.setProperty('--accent-pink', sub);
}
function changeOnlineStatus() {
    const status = document.getElementById('statusSelect').value; localStorage.setItem('iknow_online_status', status);
    const selectEl = document.getElementById('statusSelect');
    if (status === "Active Now") selectEl.style.color = "#00ff88";
    else if (status === "Sleeping") selectEl.style.color = "#ffb703";
    else selectEl.style.color = "#6c727e";
}
function loadOnlineStatus() { document.getElementById('statusSelect').value = localStorage.getItem('iknow_online_status') || "Active Now"; changeOnlineStatus(); }
function previewMedia(type) {
    const file = document.getElementById(type === 'image' ? 'postImageInput' : 'postVideoInput').files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            attachedMediaBase64 = e.target.result; attachedMediaType = type;
            document.getElementById('mediaPreviewBox').style.display = "block";
            document.getElementById('mediaPreviewContent').innerHTML = type === 'image' ? `<img src="${attachedMediaBase64}" style="max-width:100%; max-height:150px; border-radius:8px;">` : `<video src="${attachedMediaBase64}" controls style="max-width:100%; max-height:150px; border-radius:8px territory;"></video>`;
        }
        reader.readAsDataURL(file);
    }
}
function clearSelectedMedia() {
    document.getElementById('postImageInput').value = ''; document.getElementById('postVideoInput').value = '';
    document.getElementById('mediaPreviewBox').style.display = "none"; attachedMediaBase64 = ""; attachedMediaType = "";
}
function handlePostSubmit(event) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); createPost(); } }

function createPost() {
    const content = document.getElementById('postInput').value.trim();
    if (bannedKeywords.some(word => content.toLowerCase().includes(word))) { alert("🚨 Хууль бус контент нийтлэхийг хориглоно!"); document.getElementById('postInput').value = ''; return; }
    if(!content && !attachedMediaBase64) return;

    const newPost = { id: Date.now(), user: "Sainaa", content: content, timestamp: Date.now(), reactions: { likes: [], wows: [], omgs: [] }, comments: [], media: attachedMediaBase64, mediaType: attachedMediaType };
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts.unshift(newPost); localStorage.setItem('iknow_posts', JSON.stringify(posts));
    document.getElementById('postInput').value = ''; clearSelectedMedia(); renderPosts();
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('iknow_posts'));
    if(!posts) {
        posts = [{ id: 1, user: "Sainaa", content: "2040 онд #ai болон ?future хоёр салшгүй холбогдоно.", timestamp: Date.now() - 60000, reactions: { likes: [], wows: [], omgs: [] }, comments: [], media: "", mediaType: "" }];
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
    }
    renderPosts();
}

// ФЭЙСБҮҮК ШИГ АМЬД ХУГАЦАА БОДОЖ ГАРГАХ УХААЛАГ ЛОГИК
function formatTime(timestamp) {
    const t = translations[currentLang]; const diff = Date.now() - timestamp;
    if (diff < 60000) return t.justNow;
    const mins = Math.floor(diff / 60000); if (mins < 60) return mins + t.minutesAgo;
    const hours = Math.floor(mins / 60); if (hours < 24) return t.today;
    const days = Math.floor(hours / 24); return days + t.daysAgo;
}

function renderPosts() {
    const container = document.getElementById('postsContainer'); const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const t = translations[currentLang]; container.innerHTML = '';

    posts.forEach(post => {
        let cleanContent = post.content.toLowerCase();
        if (selectedTagFilter && !cleanContent.includes('#' + selectedTagFilter) && !cleanContent.includes('?' + selectedTagFilter)) return;

        let commentHTML = ''; post.comments.forEach(c => commentHTML += `<div class="comment-item">${c}</div>`);
        let mediaHTML = post.media ? (post.mediaType === 'image' ? `<img class="post-attached-img" src="${post.media}">` : `<video class="post-attached-img" src="${post.media}" controls></video>`) : '';

        let userReactedLike = (post.reactions?.likes || []).includes("Sainaa") ? "user-reacted" : "";
        let userReactedWow = (post.reactions?.wows || []).includes("Sainaa") ? "user-reacted" : "";
        let userReactedOmg = (post.reactions?.omgs || []).includes("Sainaa") ? "user-reacted" : "";

        container.innerHTML += `
            <div class="post">
                <button class="delete-btn" onclick="deletePost(${post.id})">✕</button>
                <div class="post-header"><span class="post-user">👤 ${post.user}</span><span class="badge">Timeline</span></div>
                <div class="post-time">📅 ${formatTime(post.timestamp)}</div>
                <div class="post-content">${highlightTags(post.content)}</div>
                ${mediaHTML}
                <div class="post-actions">
                    <button class="like-btn ${userReactedLike}" onclick="handleReaction(${post.id}, 'likes')">❤️ <span>${(post.reactions?.likes || []).length}</span></button>
                    <button class="like-btn ${userReactedWow}" onclick="handleReaction(${post.id}, 'wows')">😮 Wow <span>${(post.reactions?.wows || []).length}</span></button>
                    <button class="like-btn ${userReactedOmg}" onclick="handleReaction(${post.id}, 'omgs')">😱 OMG <span>${(post.reactions?.omgs || []).length}</span></button>
                </div>
                <div class="comment-section">
                    <div class="comment-list">${commentHTML}</div>
                    <div class="comment-input-group">
                        <input type="text" class="comment-input" id="input-${post.id}" placeholder="${t.commentPlaceholder}">
                        <button class="comment-btn" onclick="addComment(${post.id})">${t.send}</button>
                    </div>
                </div>
            </div>`;
    });
}
function highlightTags(text) { return text.replace(/([#?])(\w+|[\u0400-\u04FF]+)/g, '<span style="color:var(--accent); cursor:pointer;" onclick="filterByTag(\'$2\')">$1$2</span>'); }
function filterByTag(tagName) { selectedTagFilter = tagName.toLowerCase(); document.getElementById('searchTagDisplay').innerText = tagName ? `🔍 Tag: #${tagName}` : ""; renderPosts(); }
function handleReaction(postId, type) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || []; const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) {
        if (!posts[idx].reactions) posts[idx].reactions = { likes: [], wows: [], omgs: [] };
        let arr = posts[idx].reactions[type] || [];
        if (arr.includes("Sainaa")) { posts[idx].reactions[type] = arr.filter(u => u !== "Sainaa"); } 
        else {
            posts[idx].reactions.likes = (posts[idx].reactions.likes || []).filter(u => u !== "Sainaa");
            posts[idx].reactions.wows = (posts[idx].reactions.wows || []).filter(u => u !== "Sainaa");
            posts[idx].reactions.omgs = (posts[idx].reactions.omgs || []).filter(u => u !== "Sainaa");
            posts[idx].reactions[type].push("Sainaa");
        }
        localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts();
    }
}
function renderMyPosts() {
    const container = document.getElementById('myPostsContainer'); const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const myPosts = posts.filter(p => p.user === "Sainaa"); container.innerHTML = '';
    if(myPosts.length === 0) { container.innerHTML = `<p style="color:#8a8d91; text-align:center;">Одоогоор нийтлэл байхгүй байна.</p>`; return; }
    myPosts.forEach(post => {
        let mediaHTML = post.media ? (post.mediaType === 'image' ? `<img class="post-attached-img" src="${post.media}">` : `<video class="post-attached-img" src="${post.media}" controls></video>`) : '';
        container.innerHTML += `<div class="post"><div class="post-header"><span class="badge">Timeline</span></div><div class="post-time">📅 ${formatTime(post.timestamp)}</div><div class="post-content">${highlightTags(post.content)}</div>${mediaHTML}</div>`;
    });
}

// ПОСТ УСТГАХ СИСТЕМ (ТӨГС ЗАССАН)
function deletePost(postId) {
    if(!confirm("Устгах уу, андаа?")) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts = posts.filter(p => p.id !== postId); localStorage.setItem('iknow_posts', JSON.stringify(posts)); 
    renderPosts(); if(document.getElementById('page-myposts').classList.contains('active')) renderMyPosts();
}
function addComment(postId) {
    const inputField = document.getElementById(`input-${postId}`); const text = inputField.value.trim(); if(!text) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || []; const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) { posts[idx].comments.push(`Sainaa: ${text}`); localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); }
    inputField.value = '';
}
function triggerAvatarInput() { document.getElementById('avatarInput').click(); }
function changeProfileAvatar() {
    const file = document.getElementById('avatarInput').files;
    if(file) { const reader = new FileReader(); reader.onload = function(e) { localStorage.setItem('iknow_avatar', e.target.result); loadProfileAvatar(); }; reader.readAsDataURL(file); }
}
function loadProfileAvatar() { const saved = localStorage.getItem('iknow_avatar') || "https://placeholder.com"; document.getElementById('profileAvatar').src = saved; document.getElementById('sidebarAvatar').src = saved; }
function changeCoverTheme() {
    const file = document.getElementById('coverInput').files;
    if(file) { const reader = new FileReader(); reader.onload = function(e) { localStorage.setItem('iknow_cover', e.target.result); loadCoverTheme(); }; reader.readAsDataURL(file); }
}
function loadCoverTheme() { document.getElementById('profileCoverImg').src = localStorage.getItem('iknow_cover') || "https://placeholder.com"; }

function loadFriends() { let friends = JSON.parse(localStorage.getItem('iknow_friends')) || initialFriends; localStorage.setItem('iknow_friends', JSON.stringify(friends)); updateChatPartnersDropdown(friends); }
function renderFriendsList() {
    const container = document.getElementById('friendsListContainer'); container.innerHTML = '';
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    friends.forEach(f => {
        container.innerHTML += `<div class="friend-item-box"><div class="friend-info-left"><img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%;"><span style="font-weight:bold;">${f.name}</span></div><button class="friend-add-btn ${f.isFriend?'is-friend':''}" onclick="addFriendAction('${f.id}')">${f.isFriend?'🤝 Friends':'➕ Add Friend'}</button></div>`;
    });
}
function addFriendAction(id) {
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || []; const idx = friends.findIndex(f => f.id === id);
    if(idx !== -1 && !friends[idx].isFriend) { friends[idx].isFriend = true; localStorage.setItem('iknow_friends', JSON.stringify(friends)); renderFriendsList(); updateChatPartnersDropdown(friends); }
}
function updateChatPartnersDropdown(friends) {
    const select = document.getElementById('chatPartner'); if(!select) return;
    select.innerHTML = '<option value="Future Bot 🤖">Future Bot 🤖</option>';
    friends.forEach(f => { if(f.isFriend) select.innerHTML += `<option value="${f.name}">${f.name}</option>`; });
}
function handleChatSubmit(event) { if (event.key === 'Enter') { event.preventDefault(); sendDirectMessage(); } }

function loadChats() {
    const partner = document.getElementById('chatPartner').value; const chatMessages = document.getElementById('chatMessages'); chatMessages.innerHTML = '';
    document.getElementById('robotSyncPanel').style.display = partner.includes("Bot") ? "block" : "none";
    let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    let defaultText = partner.includes("Bot") ? "Миний систем бүрэн устсан... Надад зөвхөн 2040 он гэсэн хугацаа л үлдэж. 🤖" : `Сайн уу андаа! Бид одоо найзууд боллоо. 🚀`;
    let currentChat = allChats[partner] || [{ sender: 'them', text: defaultText }];
    currentChat.forEach(msg => {
        const div = document.createElement('div'); div.classList.add('msg', msg.sender === 'me' ? 'sent' : 'received'); div.innerText = msg.text; chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendDirectMessage() {
    const input = document.getElementById('chatInput'); const text = input.value.trim(); if(!text) return;
    const partner = document.getElementById('chatPartner').value; let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    if(!allChats[partner]) allChats[partner] = [{ sender: 'them', text: "Систем." }];
    allChats[partner].push({ sender: 'me', text: text }); localStorage.setItem('iknow_chats', JSON.stringify(allChats));
    input.value = ''; loadChats();

    if(partner.includes("Bot")) {
        messageCount++;
        if (messageCount >= 4 || isHeadacheMode) {
            isHeadacheMode = true; clearTimeout(headacheTimeout);
            
