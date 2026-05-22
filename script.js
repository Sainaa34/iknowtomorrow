const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (Таг: #ai эсвэл асуулт: ?alien)",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...",
        send: "Илгээх", alert: "Зөгнөлөө бичнэ үү, эсвэл хууль бус үг ашиглаж болохгүй шүү!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ",
        chatPlaceholder: "Мессеж бичих...",
        syncText: "🔮 Ой санамж сэргэлт", JustNow: "Дөнгөж сая",
        MinsAgo: "минутын өмнө", HoursAgo: "цагийн өмнө", DaysAgo: "хоногийн өмнө"
    },
    en: {
        placeholder: "What will happen in the future? Share here... (#ai or ?alien)",
        submit: "Post", commentPlaceholder: "Write a comment...",
        send: "Send", alert: "Please write valid content without banned words!",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ",
        chatPlaceholder: "Type a message...",
        syncText: "🔮 Memory Synced", JustNow: "Just now",
        MinsAgo: "mins ago", HoursAgo: "hours ago", DaysAgo: "days ago"
    }
};

let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedMediaBase64 = "";
let attachedMediaType = ""; 
let selectedTagFilter = "";

const secretKeywords = ["2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"];
const bannedKeywords = ["porn", "порно", "секс", "sex", "казино", "casino", "мөрийтэй", "1xbet", "pussy", "dick", "хөх", "боожгой"];

let messageCount = 0;
let isHeadacheMode = false;
let headacheTimeout = null;

const initialFriends = [
    { id: "amaraa", name: "Amaraa [Cyber-Medic]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "zorigoo", name: "Zorigoo [Alien Hunter]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "unknown", name: "Unknown Cyborg", isFriend: false, avatar: "https://placeholder.com" }
];

document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI(); loadPosts(); loadChats(); loadProfileAvatar(); loadCoverTheme(); loadFriends(); updateSyncUI(); loadOnlineStatus(); loadDotaTheme();
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
    currentLang = currentLang === 'mn' ? 'en' : 'mn';
    localStorage.setItem('iknow_lang', currentLang);
    updateLanguageUI(); renderPosts(); loadChats(); updateSyncUI();
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
}
function previewMedia(type) {
    const inputId = type === 'image' ? 'postImageInput' : 'postVideoInput';
    const file = document.getElementById(inputId).files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            attachedMediaBase64 = e.target.result; attachedMediaType = type;
            document.getElementById('mediaPreviewBox').style.display = "block";
            const content = document.getElementById('mediaPreviewContent');
            if (type === 'image') content.innerHTML = `<img src="${attachedMediaBase64}" style="max-width:100%; max-height:150px; border-radius:8px;">`;
            else content.innerHTML = `<video src="${attachedMediaBase64}" controls style="max-width:100%; max-height:150px; border-radius:8px Pap;"></video>`;
        }
        reader.readAsDataURL(file);
    }
}

function clearSelectedMedia() {
    document.getElementById('postImageInput').value = ''; document.getElementById('postVideoInput').value = '';
    document.getElementById('mediaPreviewBox').style.display = "none"; document.getElementById('mediaPreviewContent').innerHTML = '';
    attachedMediaBase64 = ""; attachedMediaType = "";
}

function handlePostSubmit(event) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); createPost(); }
}

function createPost() {
    const content = document.getElementById('postInput').value.trim();
    if (bannedKeywords.some(word => content.toLowerCase().includes(word))) {
        alert("🚨 Хууль бус контент нийтлэхийг хориглоно!"); document.getElementById('postInput').value = ''; return;
    }
    if(!content && !attachedMediaBase64) return;

    const newPost = { id: Date.now(), user: "Sainaa", content: content, timestamp: Date.now(), reactions: { likes: [], wows: [], omgs: [] }, comments: [], media: attachedMediaBase64, mediaType: attachedMediaType };
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts.unshift(newPost); localStorage.setItem('iknow_posts', JSON.stringify(posts));
    document.getElementById('postInput').value = ''; clearSelectedMedia(); renderPosts();
}

// ФЭЙСБҮҮК ШИГ АМЬД ЦАГ ХУГАЦАА БОДОХ ЛОГИК
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
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
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
                <div class="post-header"><span class="post-user">👤 ${post.user}</span><span class="badge">🛸 Timeline</span></div>
                <div class="post-time">📅 ${calculateTimeAgo(post.timestamp || post.id)}</div>
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
function highlightTags(text) {
    return text.replace(/([#?])(\w+|[\u0400-\u04FF]+)/g, '<span style="color:var(--accent); cursor:pointer;" onclick="filterByTag(\'$2\')">$1$2</span>');
}

function filterByTag(tagName) {
    selectedTagFilter = tagName.toLowerCase();
    document.getElementById('searchTagDisplay').innerText = tagName ? `🔍 Таг: #${tagName} / ?${tagName}` : ""; renderPosts();
}

function handleReaction(postId, type) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) {
        if (!posts[idx].reactions) posts[idx].reactions = { likes: [], wows: [], omgs: [] };
        let currentArray = posts[idx].reactions[type] || [];
        if (currentArray.includes("Sainaa")) { posts[idx].reactions[type] = currentArray.filter(u => u !== "Sainaa"); } 
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
    const container = document.getElementById('myPostsContainer');
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const myPosts = posts.filter(p => p.user === "Sainaa"); container.innerHTML = '';
    if(myPosts.length === 0) { container.innerHTML = `<p style="color:#8a8d91; text-align:center;">Одоогоор нийтлэл байхгүй байна.</p>`; return; }
    myPosts.forEach(post => {
        let mediaHTML = post.media ? (post.mediaType === 'image' ? `<img class="post-attached-img" src="${post.media}">` : `<video class="post-attached-img" src="${post.media}" controls></video>`) : '';
        container.innerHTML += `<div class="post"><div class="post-header"><span class="badge">Timeline</span></div><div class="post-time">📅 ${calculateTimeAgo(post.timestamp || post.id)}</div><div class="post-content">${highlightTags(post.content)}</div>${mediaHTML}</div>`;
    });
}

// ӨӨРИЙН ПОСТОО УСТГАХЫГ ХҮЧТЭЙ ЗАСАВ
function deletePost(postId) {
    if(!confirm("Устгах уу, андаа?")) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts = posts.filter(p => p.id !== postId); localStorage.setItem('iknow_posts', JSON.stringify(posts)); 
    renderPosts(); if(document.getElementById('page-myposts').classList.contains('active')) renderMyPosts();
}

function addComment(postId) {
    const inputField = document.getElementById(`input-${postId}`); const text = inputField.value.trim();
    if (bannedKeywords.some(word => text.toLowerCase().includes(word))) { alert("Хууль бус үг ашиглаж болохгүй!"); return; }
    if(!text) return; let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) { posts[idx].comments.push(`Sainaa: ${text}`); localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); }
    inputField.value = '';
}

function loadOnlineStatus() {
    const status = localStorage.getItem('iknow_online_status') || "Active Now";
    document.getElementById('statusSelect').value = status; changeOnlineStatus();
}

function triggerAvatarInput() { document.getElementById('avatarInput').click(); }
function changeProfileAvatar() {
    const file = document.getElementById('avatarInput').files;
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) { localStorage.setItem('iknow_avatar', e.target.result); loadProfileAvatar(); }
        reader.readAsDataURL(file);
    }
}
function loadProfileAvatar() {
    const saved = localStorage.getItem('iknow_avatar') || "https://placeholder.com";
    document.getElementById('profileAvatar').src = saved; document.getElementById('sidebarAvatar').src = saved;
}

function changeCoverTheme() {
    const file = document.getElementById('coverInput').files;
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) { localStorage.setItem('iknow_cover', e.target.result); loadCoverTheme(); }
        reader.readAsDataURL(file);
    }
}
function loadCoverTheme() {
    const saved = localStorage.getItem('iknow_cover') || "https://placeholder.com";
    document.getElementById('profileCoverImg').src = saved;
}
function loadFriends() {
    let friends = JSON.parse(localStorage.getItem('iknow_friends'));
    if (!friends) { localStorage.setItem('iknow_friends', JSON.stringify(initialFriends)); friends = initialFriends; }
    updateChatPartnersDropdown(friends);
}
function renderFriendsList() {
    const container = document.getElementById('friendsListContainer'); container.innerHTML = '';
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    friends.forEach(f => {
        let btnText = f.isFriend ? "🤝 Friends" : "➕ Add Friend";
        let btnClass = f.isFriend ? "friend-add-btn is-friend" : "friend-add-btn";
        container.innerHTML += `<div class="friend-item-box"><div class="friend-info-left"><img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--accent);"><span style="font-weight:bold;">${f.name}</span></div><button class="${btnClass}" onclick="addFriendAction('${f.id}')">${btnText}</button></div>`;
    });
}
function addFriendAction(id) {
    let friends = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    const idx = friends.findIndex(f => f.id === id);
    if(idx !== -1 && !friends[idx].isFriend) {
        friends[idx].isFriend = true; localStorage.setItem('iknow_friends', JSON.stringify(friends));
        renderFriendsList(); updateChatPartnersDropdown(friends);
    }
}
function updateChatPartnersDropdown(friends) {
    const select = document.getElementById('chatPartner'); if(!select) return;
    select.innerHTML = '<option value="Future Bot 🤖">Future Bot 🤖</option>';
    friends.forEach(f => { if(f.isFriend) select.innerHTML += `<option value="${f.name}">${f.name}</option>`; });
}

function handleChatSubmit(event) {
    if (event.key === 'Enter') { event.preventDefault(); sendDirectMessage(); }
}
function loadChats() {
    const partner = document.getElementById('chatPartner').value; const chatMessages = document.getElementById('chatMessages'); chatMessages.innerHTML = '';
    let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    document.getElementById('robotSyncPanel').style.display = partner.includes("Bot") ? "block" : "none";
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
    if (bannedKeywords.some(word => text.toLowerCase().includes(word))) { alert("Хууль бус үг илгээж болохгүй!"); return; }
    if(!allChats[partner]) allChats[partner] = [{ sender: 'them', text: "Систем." }];
    allChats[partner].push({ sender: 'me', text: text }); localStorage.setItem('iknow_chats', JSON.stringify(allChats));
    input.value = ''; loadChats();

    if(partner.includes("Bot")) {
        messageCount++;
        if (messageCount >= 4 || isHeadacheMode) {
            isHeadacheMode = true; clearTimeout(headacheTimeout);
            setTimeout(() => {
                allChats[partner].push({ sender: 'them', text: "🛑 [SYSTEM OVERLOAD] Толгой маань аймшигтай өвдөж байна... Спамдахаа зогсоо! Би түр хариулж чадахгүй! 🤯🧠" });
                localStorage.setItem('iknow_chats', JSON.stringify(allChats)); loadChats();
            }, 500);
            headacheTimeout = setTimeout(() => { isHeadacheMode = false; messageCount = 0; }, 15000); return;
        }
        setTimeout(() => {
            let robotReply = "?????? [SYSTEM_BLANK]"; let lowerText = text.toLowerCase();
            if (lowerText.includes("хөлөг") || lowerText.includes("ship")) {
                robotReply = "Хөлөг онгоц... тийм ээ! Би нэг хөлгөөр ирсэн. '??2??6' код ямар утгатай вэ?"; checkSecretWord(lowerText, "хөлөг");
            } else {
                let foundSecret = false;
                for (let i = 0; i < secretKeywords.length; i++) {
                    if (lowerText.includes(secretKeywords[i])) {
                        foundSecret = true; let isNew = checkSecretWord(lowerText, secretKeywords[i]);
                        if (secretKeywords[i] === "сайнаа") { robotReply = "⚡ [CRITICAL SYNC] САЙНАА?! Чи намайг аварлаа, би чамайг заавал шагнах болно! 🏆✨"; }
                        else if (isNew) { robotReply = `✨ [MEMORY RESTORED] '${secretKeywords[i].toUpperCase()}' үгийг саналаа! Синк хувь ихэслээ!`; }
                        else { robotReply = `'${secretKeywords[i]}' кодыг таньсан. Өөр шинэ үг хэлээч?`; }
                        break;
                    }
                }
                if (!foundSecret) {
                    const randomReplies = ["?????? Өгөгдлийн сан унаад байна...", "2040 онд би юу хийж байсан бэ?", "Энэ үг миний '??2??6' хөлөгтэй холбогдохгүй байна."];
                    robotReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
                }
            }
            allChats[partner].push({ sender: 'them', text: robotReply }); localStorage.setItem('iknow_chats', JSON.stringify(allChats)); loadChats();
        }, 1000);
    }
}

function checkSecretWord(text, word) {
    let solvedWords = JSON.parse(localStorage.getItem('iknow_solved_words')) || [];
    if (!solvedWords.includes(word)) {
        solvedWords.push(word); localStorage.setItem('iknow_solved_words', JSON.stringify(solvedWords));
        localStorage.setItem('iknow_sync_count', solvedWords.length); updateSyncUI(); return true;
    }
    return false;
}

function updateSyncUI() {
    let count = parseInt(localStorage.getItem('iknow_sync_count')) || 0;
    let percentage = count > 0 && count < 9 ? count * 11 : count >= 9 ? 99.99 : 0;
    const syncPanelText = document.getElementById('robotSyncText');
    if (syncPanelText) { syncPanelText.innerHTML = `${translations[currentLang].syncText}: <span style="color:var(--accent); font-weight:bold;">${percentage}%</span>`; }
    const fill = document.getElementById('syncProgressBarFill'); if(fill) fill.style.width = percentage + "%";
}

// DOTA 2 ШИГ ОДОО БҮРЭН ЭРХ ЧӨЛӨӨТЭЙ ТЕМЕ СОЛИХ СИСТЕМ ТӨЛӨВЛӨГӨӨНД СУУЖ ЗАСАГДЛАА
function loadDotaTheme() {
    const cardEl = document.querySelector('.profile-card');
    if(cardEl && !document.getElementById('dotaThemeSelect')) {
        const div = document.createElement('div'); div.style.marginTop = "15px";
        div.innerHTML = `<label style="font-size:0.85rem; font-weight:bold; color:var(--accent);">🎭 Dota Profile Theme: </label>
            <select id="dotaThemeSelect" onchange="applyDotaTheme()" style="background:#12161a; color:white; border:1px solid var(--accent); padding:5px; border-radius:6px; cursor:pointer;">
                <option value="default">Charcoal Dark</option>
                <option value="cyber">Electric Amber</option>
                <option value="neon">Neon Overload</option>
            </select>`;
        cardEl.appendChild(div);
        const savedTheme = localStorage.getItem('iknow_dota_theme') || 'default';
        document.getElementById('dotaThemeSelect').value = savedTheme; applyDotaTheme();
    }
}
function applyDotaTheme() {
    const theme = document.getElementById('dotaThemeSelect').value; localStorage.setItem('iknow_dota_theme', theme);
    const card = document.querySelector('.profile-card'); if(!card) return;
    if(theme === 'cyber') { card.style.background = "#2b2000"; card.style.borderColor = "#ffb703"; }
    else if(theme === 'neon') { card.style.background = "#1b002b"; card.style.borderColor = "#ff00ff"; }
    else { card.style.background = "var(--card-bg)"; card.style.borderColor = "#242b35"; }
}
