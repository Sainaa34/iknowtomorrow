const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (Таг: #ai эсвэл ?alien)",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...", send: "Илгээх", alert: "Зөгнөлөө бичнэ үү!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ", chatPlaceholder: "Мессеж бичих...",
        syncText: "🔮 Ой санамж сэргэлт", JustNow: "Дөнгөж сая", MinsAgo: "минутын өмнө", HoursAgo: "цагийн өмнө", DaysAgo: "хоногийн өмнө",
        friendsTitle: "👥 Ирээдүйн Хамтрагчид", addFriend: "➕ Хамтрагч нэмэх", unfriend: "❌ Хасах",
        editProfileBtn: "⚙️ Профайл Тохиргоог Засах", coverChangeLabel: "📷 Ковер Сэдэв Зургаа Солих",
        themeSelectLabel: "🎨 Сайтын үндсэн өнгө: ", globalSearchPlaceholder: "🔍 Хайх (Үг, таг эсвэл нэр...)"
    },
    en: {
        placeholder: "What will happen in the future? Share here... (#ai or ?alien)",
        submit: "Post", commentPlaceholder: "Write a comment...", send: "Send", alert: "Please write valid content!",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ", chatPlaceholder: "Type a message...",
        syncText: "🔮 Memory Synced", JustNow: "Just now", MinsAgo: "mins ago", HoursAgo: "hours ago", DaysAgo: "days ago",
        friendsTitle: "👥 Future Companions", addFriend: "➕ Add Friend", unfriend: "❌ Unfriend",
        editProfileBtn: "⚙️ Edit Profile Settings", coverChangeLabel: "📷 Change Cover Theme",
        themeSelectLabel: "🎨 Main Site Color: ", globalSearchPlaceholder: "🔍 Search (Tag, keyword or name...)"
    }
};
let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedMediaBase64 = "", attachedMediaType = "", selectedTagFilter = "", globalSearchQuery = "", messageCount = 0, isHeadacheMode = false, headacheTimeout = null;
const secretKeywords = ["2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"], bannedKeywords = ["porn", "порно", "секс", "sex", "казино", "casino", "мөрийтэй", "1xbet"], allAvailableTags = ["ai", "aliens", "dreams", "future", "technology"];
const initialFriends = [
    { id: "amaraa", name: "Amaraa [Cyber-Medic]", isFriend: false, avatar: "https://placeholder.com" },
    { id: "zorigoo", name: "Zorigoo [Alien Hunter]", isFriend: false, avatar: "https://placeholder.com" }
];
document.addEventListener('DOMContentLoaded', () => { updateLanguageUI(); loadPosts(); loadChats(); loadProfileAvatar(); loadCoverTheme(); loadFriends(); updateSyncUI(); loadOnlineStatus(); loadCustomSiteTheme(); });
function switchPage(p) { document.querySelectorAll('.page').forEach(x => x.classList.remove('active')); document.querySelectorAll('.menu-btn').forEach(x => x.classList.remove('active')); document.getElementById(`page-${p}`).classList.add('active'); document.getElementById(`nav-${p}`).classList.add('active'); if(p === 'myposts') renderMyPosts(); if(p === 'friends') renderFriendsList(); }
function toggleLanguage() { currentLang = currentLang === 'mn' ? 'en' : 'mn'; localStorage.setItem('iknow_lang', currentLang); updateLanguageUI(); renderPosts(); loadChats(); updateSyncUI(); if(document.getElementById('page-myposts').classList.contains('active')) renderMyPosts(); }
function updateLanguageUI() {
    const t = translations[currentLang]; document.getElementById('langBtn').innerText = currentLang === 'mn' ? 'English' : 'Монгол'; document.getElementById('postInput').placeholder = t.placeholder; document.getElementById('submitBtn').innerText = t.submit; document.getElementById('myPostsTitle').innerText = t.myPosts; document.getElementById('chatWithLabel').innerText = t.chatWith; document.getElementById('chatInput').placeholder = t.chatPlaceholder; document.getElementById('chatSendBtn').innerText = t.send; document.getElementById('friendsTitle').innerText = t.friendsTitle; document.getElementById('editProfileTriggerBtn').innerText = t.editProfileBtn; document.getElementById('coverChangeLabel').innerText = t.coverChangeLabel; document.getElementById('themeSelectLabel').innerText = t.themeSelectLabel; document.getElementById('globalSearchInput').placeholder = t.globalSearchPlaceholder; renderFriendsList();
}
function changeOnlineStatus() { const s = document.getElementById('statusSelect').value; localStorage.setItem('iknow_online_status', s); document.getElementById('statusSelect').style.color = s === "Active Now" ? "#00ff88" : s === "Sleeping" ? "#ffb703" : "#6c727e"; }
function loadOnlineStatus() { document.getElementById('statusSelect').value = localStorage.getItem('iknow_online_status') || "Active Now"; changeOnlineStatus(); }
function previewMedia(t) {
    const f = document.getElementById(t === 'image' ? 'postImageInput' : 'postVideoInput').files;
    if (f) { const r = new FileReader(); r.onload = function(e) { attachedMediaBase64 = e.target.result; attachedMediaType = t; document.getElementById('mediaPreviewBox').style.display = "block"; document.getElementById('mediaPreviewContent').innerHTML = t === 'image' ? `<img src="${attachedMediaBase64}" style="max-width:100%; max-height:150px; border-radius:8px;">` : `<video src="${attachedMediaBase64}" controls style="max-width:100%; max-height:150px; border-radius:8px;"></video>`; }; r.readAsDataURL(f); }
}
function clearSelectedMedia() { document.getElementById('postImageInput').value = ''; document.getElementById('postVideoInput').value = ''; document.getElementById('mediaPreviewBox').style.display = "none"; attachedMediaBase64 = ""; attachedMediaType = ""; }
UX = function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); createPost(); } };
function handlePostSubmit(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); createPost(); } }
function createPost() {
    const c = document.getElementById('postInput').value.trim(); if (bannedKeywords.some(w => c.toLowerCase().includes(w))) { alert("🚨 Хууль бус үг илэрлээ!"); return; } if(!c && !attachedMediaBase64) return;
    const p = { id: Date.now(), user: "Sainaa", content: c, timestamp: Date.now(), reactions: { likes: [], wows: [], omgs: [] }, effects: { fulfilled: 0, confirmed: 0, sight: 0 }, comments: [], media: attachedMediaBase64, mediaType: attachedMediaType };
    let arr = JSON.parse(localStorage.getItem('iknow_posts')) || []; arr.unshift(p); localStorage.setItem('iknow_posts', JSON.stringify(arr)); document.getElementById('postInput').value = ''; clearSelectedMedia(); renderPosts();
}
function calculateTimeAgo(ts) {
    const d = Date.now() - ts; const m = Math.floor(d / 60000); const h = Math.floor(m / 60); const dy = Math.floor(h / 24); const t = translations[currentLang];
    if (m < 1) return t.JustNow; if (m < 60) return `${m} ${t.MinsAgo}`; if (h < 24) return `${h} ${t.HoursAgo}`; return `${dy} ${t.DaysAgo}`;
}
function renderPosts() {
    const container = document.getElementById('postsContainer'); if(!container) return; container.innerHTML = '';
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || []; const t = translations[currentLang];
    let fNames = (JSON.parse(localStorage.getItem('iknow_friends')) || []).filter(x => x.isFriend).map(x => x.name); let algo = posts.length > 10;
    posts.forEach(p => {
        let cc = p.content.toLowerCase(); if (selectedTagFilter && !cc.includes('#' + selectedTagFilter) && !cc.includes('?' + selectedTagFilter)) return; if (globalSearchQuery && !cc.includes(globalSearchQuery) && !p.user.toLowerCase().includes(globalSearchQuery)) return; if (algo && p.user !== "Sainaa" && !fNames.includes(p.user)) return;
        let comm = ''; (p.comments || []).forEach(c => comm += `<div class="comment-item">${c}</div>`);
        let media = p.media ? (p.mediaType === 'image' ? `<img class="post-attached-img" src="${p.media}">` : `<video class="post-attached-img" src="${p.media}" controls></video>`) : '';
        if (!p.effects) p.effects = { fulfilled: 0, confirmed: 0, sight: 0 }; let mc = Math.max(p.effects.fulfilled, p.effects.confirmed, p.effects.sight);
        let glow = mc >= 20 ? "effect-glow-legendary" : mc >= 10 ? "effect-glow-high" : mc >= 5 ? "effect-glow-medium" : "";
        let effIcon = p.effects.fulfilled >= Math.max(p.effects.confirmed, p.effects.sight) && p.effects.fulfilled > 0 ? `🔥 <span>${p.effects.fulfilled}</span>` : p.effects.confirmed >= Math.max(p.effects.fulfilled, p.effects.sight) && p.effects.confirmed > 0 ? `⚡ <span>${p.effects.confirmed}</span>` : p.effects.sight > 0 ? `👁️ <span>${p.effects.sight}</span>` : '';
        container.innerHTML += `<div class="post ${glow}"><button class="delete-btn" onclick="deletePost(${p.id})">✕</button><div class="post-header"><span class="post-user">👤 ${p.user}</span><span class="badge">🛸 Timeline</span></div><div class="post-time">📅 ${calculateTimeAgo(p.timestamp || p.id)}</div><div class="post-content">${highlightTags(p.content)}</div>${media}<div class="post-effect-icon-slot ${mc >= 5 && p.effects.sight > 0 ? 'eye-pulse-anim':''}">${effIcon}</div><div class="reaction-container-wrapper"><button class="reaction-trigger-main-btn">✨ Ирээдүйн Баталгаа</button><div class="reaction-hover-drawer"><button class="reaction-sub-btn" onclick="triggerSpecialEffect(${p.id}, 'fulfilled')">🔮 <small>Зөн биеллээ</small></button><button class="reaction-sub-btn" onclick="triggerSpecialEffect(${p.id}, 'confirmed')">⚡ <small>Батлагдлаа</small></button><button class="reaction-sub-btn" onclick="triggerSpecialEffect(${p.id}, 'sight')">👁️ <small>Ирээдүй харлаа</small></button></div></div><div class="comment-section">${comm}<div class="comment-input-group"><input type="text" class="comment-input" id="input-${p.id}" placeholder="${t.commentPlaceholder}"><button class="comment-btn" onclick="addComment(${p.id})">${t.send}</button></div></div></div>`;
    });
}
function triggerSpecialEffect(id, type) { let posts = JSON.parse(localStorage.getItem('iknow_posts')) || []; const idx = posts.findIndex(p => p.id === id); if (idx !== -1) { if (!posts[idx].effects) posts[idx].effects = { fulfilled: 0, confirmed: 0, sight: 0 }; posts[idx].effects[type] += 1; localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); } }
function handleTagSuggestions(e) {
    const words = e.target.value.split(/\s+/); const last = words[words.length - 1]; const box = document.getElementById('tagSuggestBox');
    if (last.startsWith('#') || last.startsWith('?')) {
        const sym = last; const q = last.slice(1).toLowerCase(); const matches = allAvailableTags.filter(t => t.startsWith(q));
        if (matches.length > 0 && q.length > 0) { box.innerHTML = ''; matches.forEach(m => { const d = document.createElement('div'); d.className = 'tag-suggest-item'; d.innerText = `${sym}${m}`; d.onclick = () => { words[words.length - 1] = `${sym}${m} `; document.getElementById('postInput').value = words.join(' '); box.style.display = 'none'; document.getElementById('postInput').focus(); }; box.appendChild(d); }); box.style.display = 'block'; return; }
    } box.style.display = 'none';
}
function handleGlobalSearch() { globalSearchQuery = document.getElementById('globalSearchInput').value.trim().toLowerCase(); renderPosts(); }
function highlightTags(txt) { return txt.replace(/([#?])(\w+|[\u0400-\u04FF]+)/g, '<span style="color:var(--accent); cursor:pointer;" onclick="filterByTag(\'$2\')">$1$2</span>'); }
function filterByTag(tag) { selectedTagFilter = tag.toLowerCase(); if(document.getElementById('searchTagDisplay')) document.getElementById('searchTagDisplay').innerText = tag ? `🔍 Таг: #${tag}` : ""; renderPosts(); }
function renderMyPosts() {
    const container = document.getElementById('myPostsContainer'); if(!container) return; container.innerHTML = '';
    ((JSON.parse(localStorage.getItem('iknow_posts')) || [])).filter(p => p.user === "Sainaa").forEach(post => {
        let media = post.media ? (post.mediaType === 'image' ? `<img class="post-attached-img" src="${post.media}">` : `<video class="post-attached-img" src="${post.media}" controls></video>`) : '';
        container.innerHTML += `<div class="post"><button class="delete-btn" onclick="deletePost(${post.id})">✕</button><div class="post-header"><span class="badge">Timeline</span></div><div class="post-time">📅 ${calculateTimeAgo(post.timestamp || post.id)}</div><div class="post-content">${highlightTags(post.content)}</div>${media}</div>`;
    });
}
function deletePost(id) { if(!confirm("Устгах уу?")) return; let posts = JSON.parse(localStorage.getItem('iknow_posts')) || []; posts = posts.filter(p => p.id !== id); localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); if(document.getElementById('page-myposts').classList.contains('active')) renderMyPosts(); }
function addComment(id) { const input = document.getElementById(`input-${id}`); const txt = input.value.trim(); if(!txt) return; let posts = JSON.parse(localStorage.getItem('iknow_posts')) || []; const idx = posts.findIndex(p => p.id === id); if(idx !== -1) { posts[idx].comments.push(`Sainaa: ${txt}`); localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); } input.value = ''; }
function toggleEditOptions() { const p = document.getElementById('editOptionsPanel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; }
function triggerAvatarInput() { document.getElementById('avatarInput').click(); }
function changeProfileAvatar() { const file = document.getElementById('avatarInput').files; if(file) { const r = new FileReader(); r.onload = function(e) { localStorage.setItem('iknow_avatar', e.target.result); loadProfileAvatar(); }; r.readAsDataURL(file); } }
function loadProfileAvatar() { const s = localStorage.getItem('iknow_avatar') || "https://placeholder.com"; if(document.getElementById('profileAvatar')) document.getElementById('profileAvatar').src = s; if(document.getElementById('sidebarAvatar')) document.getElementById('sidebarAvatar').src = s; }
function changeCoverTheme() { const file = document.getElementById('coverInput').files; if(file) { const r = new FileReader(); r.onload = function(e) { localStorage.setItem('iknow_cover', e.target.result); loadCoverTheme(); }; r.readAsDataURL(file); } }
function loadCoverTheme() { if(document.getElementById('profileCoverImg')) document.getElementById('profileCoverImg').src = localStorage.getItem('iknow_cover') || "https://placeholder.com"; }
function loadFriends() { let f = JSON.parse(localStorage.getItem('iknow_friends')) || initialFriends; localStorage.setItem('iknow_friends', JSON.stringify(f)); updateChatPartnersDropdown(f); }
function renderFriendsList() {
    const c = document.getElementById('friendsListContainer'); if(!c) return; c.innerHTML = ''; let f = JSON.parse(localStorage.getItem('iknow_friends')) || [];
    f.forEach(fr => { c.innerHTML += `<div class="friend-item-box"><div class="friend-info-left"><img src="${fr.avatar}" style="width:40px; height:40px; border-radius:50%;"><span style="font-weight:bold;">${fr.name}</span></div><button class="friend-add-btn ${fr.isFriend ? 'is-friend':''}" onclick="toggleFriendAction('${fr.id}')">${fr.isFriend ? translations[currentLang].unfriend : translations[currentLang].addFriend}</button></div>`; });
}
function toggleFriendAction(id) { let f = JSON.parse(localStorage.getItem('iknow_friends')) || []; const idx = f.findIndex(fr => fr.id === id); if(idx !== -1) { f[idx].isFriend = !f[idx].isFriend; localStorage.setItem('iknow_friends', JSON.stringify(f)); renderFriendsList(); updateChatPartnersDropdown(f); loadChats(); renderPosts(); } }
function updateChatPartnersDropdown(f) { const s = document.getElementById('chatPartner'); if(!s) return; s.innerHTML = '<option value="Future Bot 🤖">Future Bot 🤖</option>'; f.forEach(fr => { if(fr.isFriend) s.innerHTML += `<option value="${fr.name}">${fr.name}</option>`; }); }
function handleChatSubmit(e) { if (e.key === 'Enter') { e.preventDefault(); sendDirectMessage(); } }
function loadChats() {
    const p = document.getElementById('chatPartner')?.value; const cm = document.getElementById('chatMessages'); if(!cm || !p) return; cm.innerHTML = ''; if(document.getElementById('robotSyncPanel')) document.getElementById('robotSyncPanel').style.display = p.includes("Bot") ? "block" : "none";
    let currentChat = (JSON.parse(localStorage.getItem('iknow_chats')) || {})[p] || [{ sender: 'them', text: p.includes("Bot") ? "Миний систем бүрэн устсан... 🤖" : "Сайн уу андаа!" }];
    currentChat.forEach(msg => { const d = document.createElement('div'); d.classList.add('msg', msg.sender === 'me' ? 'sent' : 'received'); d.innerText = msg.text; cm.appendChild(d); }); cm.scrollTop = cm.scrollHeight;
}
function sendDirectMessage() {
    const input = document.getElementById('chatInput'); const txt = input.value.trim(); if(!txt) return; const p = document.getElementById('chatPartner').value; let all = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    if(!all[p]) all[p] = []; all[p].push({ sender: 'me', text: txt }); localStorage.setItem('iknow_chats', JSON.stringify(all)); input.value = ''; loadChats();
    if(p.includes("Bot")) {
        messageCount++; if (messageCount >= 4 || isHeadacheMode) { isHeadacheMode = true; clearTimeout(headacheTimeout); all[p].push({ sender: 'them', text: "🛑 [SYSTEM OVERLOAD] Толгой маань өвдөж байна! 🤯🧠" }); localStorage.setItem('iknow_chats', JSON.stringify(all)); loadChats(); headacheTimeout = setTimeout(() => { isHeadacheMode = false; messageCount = 0; }, 15000); return; }
        setTimeout(() => {
            let robotReply = "?????? [SYSTEM_BLANK]"; let lt = txt.toLowerCase();
            if (lt.includes("хөлөг") || lt.includes("ship")) { robotReply = "Хөлөг онгоц... Би нэг хөлгөөр ирсэн. '??2??6' код ямар утгатай вэ?"; checkSecretWord(lt, "хөлөг"); } 
            else { for (let i = 0; i < secretKeywords.length; i++) { if (lt.includes(secretKeywords[i])) { let isNew = checkSecretWord(lt, secretKeywords[i]); robotReply = secretKeywords[i] === "сайнаа" ? "⚡ САЙНАА?! Чи намайг аварлаа! 🏆✨" : isNew ? `✨ '${secretKeywords[i].toUpperCase()}' үгийг саналаа!` : `'${secretKeywords[i]}' кодыг таньсан.`; break; } } }
            all[p].push({ sender: 'them', text: robotReply }); localStorage.setItem('iknow_chats', JSON.stringify(all)); loadChats();
        }, 1000);
    }
}
function checkSecretWord(txt, word) { let sw = JSON.parse(localStorage.getItem('iknow_solved_words')) || []; if (!sw.includes(word)) { sw.push(word); localStorage.setItem('iknow_solved_words', JSON.stringify(sw)); localStorage.setItem('iknow_sync_count', sw.length); updateSyncUI(); return true; } return false; }
function updateSyncUI() {
    let count = parseInt(localStorage.getItem('iknow_sync_count')) || 0; let percentage = count > 0 && count < 9 ? count * 11 : count >= 9 ? 99.99 : 0;
    if (document.getElementById('robotSyncText')) document.getElementById('robotSyncText').innerHTML = `${translations[currentLang].syncText}: <span style="color:var(--accent); font-weight:bold;">${percentage}%</span>`;
    if (document.getElementById('syncProgressBarFill')) document.getElementById('syncProgressBarFill').style.width = percentage + "%";
}
function loadCustomSiteTheme() { applySiteCustomTheme(); }
function applySiteCustomTheme() {
    const theme = document.getElementById('siteThemeSelect')?.value || localStorage.getItem('iknow_site_theme') || 'default'; if(document.getElementById('siteThemeSelect')) document.getElementById('siteThemeSelect').value = theme; localStorage.setItem('iknow_site_theme', theme); const r = document.documentElement;
    if(theme === 'dark-purple') { r.style.setProperty('--bg-color', '#130d1a'); r.style.setProperty('--card-bg', '#1f142b'); r.style.setProperty('--accent', '#bf40bf'); r.style.setProperty('--accent-pink', '#e066ff'); } 
    else if(theme === 'cyber-blue') { r.style.setProperty('--bg-color', '#09141c'); r.style.setProperty('--card-bg', '#112230'); r.style.setProperty('--accent', '#00f2fe'); r.style.setProperty('--accent-pink', '#4facfe'); } 
    else { r.style.setProperty('--bg-color', '#12161a'); r.style.setProperty('--card-bg', '#1a1f26'); r.style.setProperty('--accent', '#ffb703'); r.style.setProperty('--accent-pink', '#ffc300'); }
}
