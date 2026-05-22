const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (Таг ашиглаж болно #ai эсвэл асуулт тавихдаа ?alien)",
        submit: "Нийтлэх",
        commentPlaceholder: "Сэтгэгдэл бичих...",
        send: "Илгээх",
        alert: "Зөгнөлөө бичнэ үү, эсвэл хууль бус үг ашиглаж болохгүй шүү!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд",
        chatWith: "Хэнтэй чатлах: ",
        chatPlaceholder: "Мессеж бичих...",
        syncText: "🔮 Ой санамж сэргэлт",
        JustNow: "Дөнгөж сая",
        MinsAgo: "минутын өмнө",
        HoursAgo: "цагийн өмнө",
        DaysAgo: "хоногийн өмнө",
        friendsTitle: "👥 Ирээдүйн Хамтрагчид / Friends",
        addFriend: "➕ Add Friend",
        unfriend: "❌ Unfriend",
        editProfileBtn: "⚙️ Профайл Тохиргоог Засах",
        coverChangeLabel: "📷 Ковер Сэдэв Зургаа Солих",
        themeSelectLabel: "🎨 Сайтын үндсэн өнгө: ",
        globalSearchPlaceholder: "🔍 Хайх (Үг, таг эсвэл нэр...)"
    },
    en: {
        placeholder: "What will happen in the future? Share here... (Use #ai or ?alien for questions)",
        submit: "Post",
        commentPlaceholder: "Write a comment...",
        send: "Send",
        alert: "Please write valid content without banned words!",
        myPosts: "📌 My Predictions",
        chatWith: "Chat with: ",
        chatPlaceholder: "Type a message...",
        syncText: "🔮 Memory Synced",
        JustNow: "Just now",
        MinsAgo: "mins ago",
        HoursAgo: "hours ago",
        DaysAgo: "days ago",
        friendsTitle: "👥 Future Companions",
        addFriend: "➕ Add Friend",
        unfriend: "❌ Unfriend",
        editProfileBtn: "⚙️ Edit Profile Settings",
        coverChangeLabel: "📷 Change Cover Theme",
        themeSelectLabel: "🎨 Main Site Color: ",
        globalSearchPlaceholder: "🔍 Search (Tag, keyword or name...)"
    }
};

let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedMediaBase64 = "";
let attachedMediaType = ""; 
let selectedTagFilter = "";
let globalSearchQuery = "";
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

document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI();
    loadPosts();
    loadChats();
    loadProfileAvatar();
    loadCoverTheme();
    loadFriends();
    updateSyncUI();
    loadOnlineStatus();
    loadCustomSiteTheme();
});

function switchPage(pageId) {
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
    renderFriendsList();
}

function changeOnlineStatus() {
    const status = document.getElementById('statusSelect').value;
    localStorage.setItem('iknow_online_status', status);
    const selectEl = document.getElementById('statusSelect');
    if (status === "Active Now") selectEl.style.color = "#00ff88";
    else if (status === "Sleeping") selectEl.style.color = "#ffb703";
    else selectEl.style.color = "#6c727e";
}

function loadOnlineStatus() {
    const status = localStorage.getItem('iknow_online_status') || "Active Now";
    document.getElementById('statusSelect').value = status;
    changeOnlineStatus();
}

function previewMedia(type) {
    const inputId = type === 'image' ? 'postImageInput' : 'postVideoInput';
    const file = document.getElementById(inputId).files[0];
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
    let lowerContent = content.toLowerCase();
    let hasBannedWord = bannedKeywords.some(word => lowerContent.includes(word));
    
    if (hasBannedWord) {
        alert("🚨 [SECURITY WARNING] Хууль бус контент (Садар самуун, Мөрийтэй тоглоом) нийтлэхийг хориглоно! Таны постыг устгалаа.");
        document.getElementById('postInput').value = '';
        return;
    }

    if (!content && !attachedMediaBase64) {
        alert(translations[currentLang].alert);
        return;
    }

    const newPost = { 
        id: Date.now(), 
        user: "Sainaa", 
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
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const t = translations[currentLang];

    if (seconds < 60) return t.JustNow;
    if (minutes < 60) return `${minutes} ${t.MinsAgo}`;
    if (hours < 24) return `${hours} ${t.HoursAgo}`;
    return `${days} ${t.DaysAgo}`;
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const t = translations[currentLang];
    container.innerHTML = '';

    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    let friendNames = friends.filter(f => f.isFriend).map(f => f.name);
    let isAlgorithmActive = posts.length > 10;

    posts.forEach(post => {
        let cleanContent = post.content.toLowerCase();
        let cleanUser = post.user;

        if (selectedTagFilter && !cleanContent.includes('#' + selectedTagFilter) && !cleanContent.includes('?' + selectedTagFilter)) return;
        if (globalSearchQuery && !cleanContent.includes(globalSearchQuery) && !cleanUser.toLowerCase().includes(globalSearchQuery)) return;
        if (isAlgorithmActive && post.user !== "Sainaa" && !friendNames.includes(post.user)) return;

        let commentHTML = '';
        (post.comments || []).forEach(c => commentHTML += `<div class="comment-item">${c}</div>`);
        
        let mediaHTML = '';
        if (post.media) {
            if (post.mediaType === 'image') {
                mediaHTML = `<img class="post-attached-img" src="${post.media}">`;
            } else if (post.mediaType === 'video') {
                mediaHTML = `<video class="post-attached-img" src="${post.media}" controls></video>`;
            }
        }

        if (!post.effects) post.effects = { fulfilled: 0, confirmed: 0, sight: 0 };
        let mc = Math.max(post.effects.fulfilled, post.effects.confirmed, post.effects.sight);
        
        let glowClass = "";
        if (mc >= 5 && mc < 10) glowClass = "effect-glow-medium";
        else if (mc >= 10 && mc < 20) glowClass = "effect-glow-high";
        else if (mc >= 20) glowClass = "effect-glow-legendary";

        let effectIconHTML = "";
        if (post.effects.fulfilled >= Math.max(post.effects.confirmed, post.effects.sight) && post.effects.fulfilled > 0) {
            effectIconHTML = `<div class="post-effect-icon-slot">🔥 <span>${post.effects.fulfilled}</span></div>`;
        } else if (post.effects.confirmed >= Math.max(post.effects.fulfilled, post.effects.sight) && post.effects.confirmed > 0) {
            effectIconHTML = `<div class="post-effect-icon-slot">⚡ <span>${post.effects.confirmed}</span></div>`;
        } else if (post.effects.sight > 0) {
            let eyeAnim = mc >= 5 ? "eye-pulse-anim" : "";
            effectIconHTML = `<div class="post-effect-icon-slot ${eyeAnim}">👁️ <span>${post.effects.sight}</span></div>`;
        }

        let userReactedLike = (post.reactions?.likes || []).includes("Sainaa") ? "user-reacted" : "";
        let userReactedWow = (post.reactions?.wows || []).includes("Sainaa") ? "user-reacted" : "";
        let userReactedOmg = (post.reactions?.omgs || []).includes("Sainaa") ? "user-reacted" : "";

        container.innerHTML += `
            <div class="post ${glowClass}">
                <button class="delete-btn" onclick="deletePost(${post.id})">✕</button>
                <div class="post-header"><span class="post-user">👤 ${post.user}</span><span class="badge">🛸 Timeline</span></div>
                <div class="post-time">📅 ${calculateTimeAgo(post.timestamp || post.id)}</div>
                <div class="post-content">${highlightTags(post.content)}</div>
                ${mediaHTML}
                ${effectIconHTML}
                
                <div class="reaction-container-wrapper">
                    <button class="reaction-trigger-main-btn">✨ Ирээдүйн Баталгаа</button>
                    <div class="reaction-hover-drawer">
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${post.id}, 'fulfilled')">🔮 <small>Зөн биеллээ</small></button>
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${post.id}, 'confirmed')">⚡ <small>Батлагдлаа</small></button>
                        <button class="reaction-sub-btn" onclick="triggerSpecialEffect(${post.id}, 'sight')">👁️ <small>Ирээдүй харлаа</small></button>
                        <button class="reaction-sub-btn ${userReactedLike}" onclick="handleReaction(${post.id}, 'likes')">❤️</button>
                        <button class="reaction-sub-btn ${userReactedWow}" onclick="handleReaction(${post.id}, 'wows')">😮</button>
                        <button class="reaction-sub-btn ${userReactedOmg}" onclick="handleReaction(${post.id}, 'omgs')">😱</button>
                    </div>
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
function triggerSpecialEffect(postId, effectType) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
        if (!posts[idx].effects) posts[idx].effects = { fulfilled: 0, confirmed: 0, sight: 0 };
        posts[idx].effects[effectType] += 1;
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderPosts();
    }
}

function handleTagSuggestions(event) {
    const text = event.target.value;
    const box = document.getElementById('tagSuggestBox');
    const words = text.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('#') || lastWord.startsWith('?')) {
        const symbol = lastWord.charAt(0);
        const query = lastWord.slice(1).toLowerCase();
        const matches = allAvailableTags.filter(t => t.startsWith(query));
        
        if (matches.length > 0 && query.length > 0) {
            box.innerHTML = '';
            matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'tag-suggest-item';
                item.innerText = `${symbol}${match}`;
                item.onclick = () => applyTagSuggestion(symbol, match);
                box.appendChild(item);
            });
            box.style.display = 'block';
            return;
        }
    }
    box.style.display = 'none';
}

function applyTagSuggestion(symbol, tag) {
    const input = document.getElementById('postInput');
    const words = input.value.split(/\s+/);
    words[words.length - 1] = `${symbol}${tag} `;
    input.value = words.join(' ');
    document.getElementById('tagSuggestBox').style.display = 'none';
    input.focus();
}

function handleGlobalSearch() {
    globalSearchQuery = document.getElementById('globalSearchInput').value.trim().toLowerCase();
    renderPosts();
}

function highlightTags(text) {
    return text.replace(/([#?])(\w+|[\u0400-\u04FF]+)/g, '<span style="color:var(--accent); cursor:pointer;" onclick="filterByTag(\'$2\')">$1$2</span>');
}

function filterByTag(tagName) {
    selectedTagFilter = tagName.toLowerCase();
    const display = document.getElementById('searchTagDisplay');
    if (display) display.innerText = tagName ? `🔍 Таг: #${tagName} / ?${tagName}` : "";
    renderPosts();
}

function handleReaction(postId, type) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) {
        if (!posts[idx].reactions) posts[idx].reactions = { likes: [], wows: [], omgs: [] };
        let currentArray = posts[idx].reactions[type] || [];
        
        if (currentArray.includes("Sainaa")) {
            posts[idx].reactions[type] = currentArray.filter(u => u !== "Sainaa");
        } else {
            posts[idx].reactions.likes = (posts[idx].reactions.likes || []).filter(u => u !== "Sainaa");
            posts[idx].reactions.wows = (posts[idx].reactions.wows || []).filter(u => u !== "Sainaa");
            posts[idx].reactions.omgs = (posts[idx].reactions.omgs || []).filter(u => u !== "Sainaa");
            posts[idx].reactions[type].push("Sainaa");
        }
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderPosts();
    }
}
function renderMyPosts() {
    const container = document.getElementById('myPostsContainer');
    if (!container) return;
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const myPosts = posts.filter(p => p.user === "Sainaa");
    container.innerHTML = '';
    
    if (myPosts.length === 0) {
        container.innerHTML = `<p style="color:#8a8d91; text-align:center;">Одоогоор нийтлэл байхгүй байна.</p>`;
        return;
    }
    
    myPosts.forEach(post => {
        let mediaHTML = post.media ? (post.mediaType === 'image' ? `<img class="post-attached-img" src="${post.media}">` : `<video class="post-attached-img" src="${post.media}" controls></video>`) : '';
        container.innerHTML += `
            <div class="post">
                <button class="delete-btn" onclick="deletePost(${post.id})">✕</button>
                <div class="post-header"><span class="badge">Timeline</span></div>
                <div class="post-time">📅 ${calculateTimeAgo(post.timestamp || post.id)}</div>
                <div class="post-content">${highlightTags(post.content)}</div>
                ${mediaHTML}
            </div>`;
    });
}

function deletePost(postId) {
    if (!confirm("Устгах уу, андаа?")) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('iknow_posts', JSON.stringify(posts));
    renderPosts();
    if (document.getElementById('page-myposts').classList.contains('active')) {
        renderMyPosts();
    }
}

function addComment(postId) {
    const inputField = document.getElementById(`input-${postId}`);
    const text = inputField.value.trim();
    if (bannedKeywords.some(word => text.toLowerCase().includes(word))) {
        alert("Хууль бус үг ашиглаж болохгүй!");
        return;
    }
    if (!text) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
        posts[idx].comments.push(`Sainaa: ${text}`);
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
        renderPosts();
    }
    inputField.value = '';
}

function toggleEditOptions() {
    const panel = document.getElementById('editOptionsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function triggerAvatarInput() {
    document.getElementById('avatarInput').click();
}

function changeProfileAvatar() {
    const file = document.getElementById('avatarInput').files;
    if (file && file[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem('iknow_avatar', e.target.result);
            loadProfileAvatar();
        };
        reader.readAsDataURL(file[0]);
    }
}

function loadProfileAvatar() {
    const saved = localStorage.getItem('iknow_avatar') || "https://placeholder.com";
    if (document.getElementById('profileAvatar')) document.getElementById('profileAvatar').src = saved;
    if (document.getElementById('sidebarAvatar')) document.getElementById('sidebarAvatar').src = saved;
}

function changeCoverTheme() {
    const file = document.getElementById('coverInput').files;
    if (file && file[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem('iknow_cover', e.target.result);
            loadCoverTheme();
        };
        reader.readAsDataURL(file[0]);
    }
}

function loadCoverTheme() {
    const saved = localStorage.getItem('iknow_cover') || "https://placeholder.com";
    if (document.getElementById('profileCoverImg')) document.getElementById('profileCoverImg').src = saved;
}
function loadFriends() {
    let friends = JSON.parse(localStorage.getItem('iknow_friends'));
    if (!friends) {
        localStorage.setItem('iknow_friends', JSON.stringify(initialFriends));
        friends = initialFriends;
    }
    updateChatPartnersDropdown(friends);
}

function renderFriendsList() {
    const container = document.getElementById('friendsListContainer');
    if (!container) return;
    container.innerHTML = '';
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    
    friends.forEach(f => {
        let btnText = f.isFriend ? translations[currentLang].unfriend : translations[currentLang].addFriend;
        let btnClass = f.isFriend ? "friend-add-btn is-friend" : "friend-add-btn";
        container.innerHTML += `
            <div class="friend-item-box">
                <div class="friend-info-left">
                    <img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <span style="font-weight:bold;">${f.name}</span>
                </div>
                <button class="${btnClass}" onclick="toggleFriendAction('${f.id}')">${btnText}</button>
            </div>`;
    });
}

function toggleFriendAction(id) {
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    const idx = friends.findIndex(f => f.id === id);
    if (idx !== -1) {
        friends[idx].isFriend = !friends[idx].isFriend;
        localStorage.setItem('iknow_friends', JSON.stringify(friends));
        renderFriendsList();
        updateChatPartnersDropdown(friends);
        loadChats();
        renderPosts();
    }
}

function updateChatPartnersDropdown(friends) {
    const select = document.getElementById('chatPartner');
    if (!select) return;
    select.innerHTML = '<option value="Future Bot 🤖">Future Bot 🤖</option>';
    friends.forEach(f => {
        if (f.isFriend) select.innerHTML += `<option value="${f.name}">${f.name}</option>`;
    });
}

function handleChatSubmit(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendDirectMessage();
    }
}

function loadChats() {
    const partner = document.getElementById('chatPartner').value;
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    
    if (document.getElementById('robotSyncPanel')) {
        document.getElementById('robotSyncPanel').style.display = partner.includes("Bot") ? "block" : "none";
    }
    
    let currentChat = (JSON.parse(localStorage.getItem('iknow_chats')) || {})[partner] || [
        { sender: 'them', text: partner.includes("Bot") ? "Миний систем бүрэн устсан... Надад зөвхөн 2040 он гэсэн хугацаа л үлдэж. 🤖" : "Сайн уу андаа! Чатлахад бэлэн байна. 🚀" }
    ];
    
    currentChat.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('msg', msg.sender === 'me' ? 'sent' : 'received');
        div.innerText = msg.text;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendDirectMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    const partner = document.getElementById('chatPartner').value;
    let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    
    if (bannedKeywords.some(word => text.toLowerCase().includes(word))) {
        alert("Хууль бус үг илгээж болохгүй!");
        return;
    }
    
    if (!allChats[partner]) allChats[partner] = [];
    allChats[partner].push({ sender: 'me', text: text });
    localStorage.setItem('iknow_chats', JSON.stringify(allChats));
    input.value = '';
    loadChats();

    if (partner.includes("Bot")) {
        messageCount++;
        if (messageCount >= 4 || isHeadacheMode) {
            isHeadacheMode = true;
            clearTimeout(headacheTimeout);
            setTimeout(() => {
                allChats[partner].push({ sender: 'them', text: "🛑 [SYSTEM OVERLOAD] Толгой маань аймшигтай өвдөж байна... Спамдахаа зогсоо! Би түр хариулж чадахгүй! 🤯🧠" });
                localStorage.setItem('iknow_chats', JSON.stringify(allChats));
                loadChats();
            }, 500);
            headacheTimeout = setTimeout(() => { isHeadacheMode = false; messageCount = 0; }, 15000);
            return;
        }
        
        setTimeout(() => {
            let robotReply = "?????? [SYSTEM_BLANK]";
            let lowerText = text.toLowerCase();
            
            if (lowerText.includes("хөлөг") || lowerText.includes("ship")) {
                robotReply = "Хөлөг онгоц... тийм ээ! Би нэг хөлгөөр ирсэн. '??2??6' код ямар утгатай вэ?";
                checkSecretWord(lowerText, "хөлөг");
            } else {
                let foundSecret = false;
                for (let i = 0; i < secretKeywords.length; i++) {
                    if (lowerText.includes(secretKeywords[i])) {
                        foundSecret = true;
                        let isNew = checkSecretWord(lowerText, secretKeywords[i]);
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
                if (!foundSecret) {
                    const randomReplies = [
                        "?????? Миний өгөгдлийн сан унаад байна...",
                        "2040 онд би юу хийж байсан бэ?",
                        "Энэ үг миний '??2??6' хөлөгтэй холбогдохгүй байна."
                    ];
                    robotReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
                }
            }
            allChats[partner].push({ sender: 'them', text: robotReply });
            localStorage.setItem('iknow_chats', JSON.stringify(allChats));
            loadChats();
        }, 1000);
    }
}

function checkSecretWord(text, word) {
    let solvedWords = JSON.parse(localStorage.getItem('iknow_solved_words')) || [];
    if (!solvedWords.includes(word)) {
        solvedWords.push(word);
        localStorage.setItem('iknow_solved_words', JSON.stringify(solvedWords));
        localStorage.setItem('iknow_sync_count', solvedWords.length);
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
