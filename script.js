const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц...",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...",
        send: "Илгээх", alert: "Зөгнөлөө бичнэ үү, андаа!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ",
        chatPlaceholder: "Мессеж бичих...",
        categories: ["🤖 Хиймэл оюун ухаан (AI)", "🚀 Ирээдүйн Технологи", "🔮 Зүүд ба Зөн совин", "👽 Харийн гариг", "🦾 Хиймэл эрхтэн / Киборг"]
    },
    en: {
        placeholder: "What will happen in the future? Share here...",
        submit: "Post", commentPlaceholder: "Write a comment...",
        send: "Send", alert: "Please write your prediction first!",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ",
        chatPlaceholder: "Type a message...",
        categories: ["🤖 Artificial Intelligence (AI)", "🚀 Future Technology", "🔮 Dreams & Intuition", "👽 Aliens & Outer Space", "🦾 Artificial Organs / Cyborg"]
    }
};

let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedImageBase64 = "";

// РОБОТЫН ТОГЛООМНЫ СИСТЕМ (ТАЙЛАХ 9 НУУЦ ҮГ)
const secretKeywords = [
    "2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"
];

let messageCount = 0;
let isHeadacheMode = false;
let headacheTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI(); loadPosts(); loadChats(); loadProfileAvatar(); updateSyncUI();
});

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.getElementById(`nav-${pageId}`).classList.add('active');
    if(pageId === 'profile') renderMyPosts();
}

function toggleLanguage() {
    currentLang = currentLang === 'mn' ? 'en' : 'mn';
    localStorage.setItem('iknow_lang', currentLang);
    updateLanguageUI(); renderPosts();
    if(document.getElementById('page-profile').classList.contains('active')) renderMyPosts();
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

    const select = document.getElementById('categorySelect'); select.innerHTML = '';
    t.categories.forEach(cat => {
        const opt = document.createElement('option'); opt.value = cat; opt.innerText = cat; select.appendChild(opt);
    });
}

function updateProfileName() {
    document.getElementById('profileName').innerText = document.getElementById('userSelect').value;
    document.getElementById('sidebarName').innerText = document.getElementById('userSelect').value;
}

function previewPostImage() {
    const file = document.getElementById('postImageInput').files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            attachedImageBase64 = e.target.result;
            const preview = document.getElementById('postImgPreview');
            preview.src = attachedImageBase64; preview.style.display = "block";
        }
        reader.readAsDataURL(file);
    }
}

function createPost() {
    const content = document.getElementById('postInput').value.trim();
    const category = document.getElementById('categorySelect').value;
    const user = document.getElementById('userSelect').value;
    if(!content && !attachedImageBase64) { alert(translations[currentLang].alert); return; }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newPost = { id: Date.now(), user: user, category: category, content: content, time: formattedDate, likes: 0, wows: 0, omgs: 0, comments: [], image: attachedImageBase64 };
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts.unshift(newPost); localStorage.setItem('iknow_posts', JSON.stringify(posts));
    
    document.getElementById('postInput').value = '';
    document.getElementById('postImageInput').value = '';
    document.getElementById('postImgPreview').style.display = "none";
    attachedImageBase64 = "";
    renderPosts();
}
function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('iknow_posts'));
    if(!posts) {
        posts = [{ id: 1, user: "Sainaa", category: "🤖 Хиймэл оюун ухаан (AI)", content: "2030 он гэхэд энэ сошиал сайт дээр хүмүүс тархиараа холбогдож пост оруулдаг болох байх даа!", time: "2026/05/22 19:45", likes: 5, wows: 2, omgs: 1, comments: ["Үнэхээр гайхалтай зөгнөл байна! 🔥"], image: "" }];
        localStorage.setItem('iknow_posts', JSON.stringify(posts));
    }
    renderPosts();
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const t = translations[currentLang]; container.innerHTML = '';

    posts.forEach(post => {
        let commentHTML = '';
        post.comments.forEach(c => commentHTML += `<div class="comment-item">${c}</div>`);
        let imgHTML = post.image ? `<img class="post-attached-img" src="${post.image}">` : '';

        container.innerHTML += `
            <div class="post">
                <button class="delete-btn" onclick="deletePost(${post.id})">✕</button>
                <div class="post-header"><span class="post-user">👤 ${post.user}</span><span class="badge">${post.category}</span></div>
                <div class="post-time">📅 ${post.time}</div>
                <div class="post-content">${post.content}</div>
                ${imgHTML}
                <div class="post-actions">
                    <button class="like-btn" onclick="handleReaction(${post.id}, 'likes')">❤️ <span>${post.likes || 0}</span></button>
                    <button class="like-btn style-wow" onclick="handleReaction(${post.id}, 'wows')">😮 Wow <span>${post.wows || 0}</span></button>
                    <button class="like-btn style-omg" onclick="handleReaction(${post.id}, 'omgs')">😱 OMG <span>${post.omgs || 0}</span></button>
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

function handleReaction(postId, type) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) { posts[idx][type] = (posts[idx][type] || 0) + 1; localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); }
}

function renderMyPosts() {
    const container = document.getElementById('myPostsContainer');
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const currentUser = document.getElementById('userSelect').value;
    const myPosts = posts.filter(p => p.user === currentUser); container.innerHTML = '';
    if(myPosts.length === 0) { container.innerHTML = `<p style="color:#8a8d91; text-align:center;">Одоогоор нийтлэл байхгүй байна.</p>`; return; }
    myPosts.forEach(post => {
        let imgHTML = post.image ? `<img class="post-attached-img" src="${post.image}">` : '';
        container.innerHTML += `<div class="post"><div class="post-header"><span class="badge">${post.category}</span></div><div class="post-time">📅 ${post.time}</div><div class="post-content">${post.content}</div>${imgHTML}</div>`;
    });
}

function deletePost(postId) {
    if(!confirm("Энэ зөгнөлийг устгах уу, андаа?")) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts = posts.filter(p => p.id !== postId); localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts();
}

function addComment(postId) {
    const inputField = document.getElementById(`input-${postId}`); const text = inputField.value.trim(); if(!text) return;
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) { posts[idx].comments.push(text); localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); }
    inputField.value = '';
}

function changeProfileAvatar() {
    const file = document.getElementById('avatarInput').files;
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) { const base64 = e.target.result; localStorage.setItem('iknow_avatar', base64); loadProfileAvatar(); }
        reader.readAsDataURL(file);
    }
}

function loadProfileAvatar() {
    const savedAvatar = localStorage.getItem('iknow_avatar') || "https://placeholder.com";
    document.getElementById('profileAvatar').src = savedAvatar; document.getElementById('sidebarAvatar').src = savedAvatar;
}

function loadChats() {
    const partner = document.getElementById('chatPartner').value; const chatMessages = document.getElementById('chatMessages'); chatMessages.innerHTML = '';
    let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    let defaultText = partner.includes("Bot") ? "Миний систем бүрэн устсан... Надад зөвхөн 2040 он гэсэн хугацаа л үлдэж. Хэрэв чи миний ой санамжийг тааж чадвал шагнах болно... 🤖" : "Сайн уу! 🚀";
    let currentChat = allChats[partner] || [{ sender: 'them', text: defaultText }];
    currentChat.forEach(msg => {
        const div = document.createElement('div'); div.classList.add('msg', msg.sender === 'me' ? 'sent' : 'received'); div.innerText = msg.text; chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendDirectMessage() {
    const input = document.getElementById('chatInput'); const text = input.value.trim(); if(!text) return;
    const partner = document.getElementById('chatPartner').value; let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    if(!allChats[partner]) allChats[partner] = [{ sender: 'them', text: "Миний систем устсан..." }];
    allChats[partner].push({ sender: 'me', text: text }); localStorage.setItem('iknow_chats', JSON.stringify(allChats));
    input.value = ''; loadChats();

    if(partner.includes("Bot")) {
        messageCount++;
        if (messageCount >= 4 || isHeadacheMode) {
            isHeadacheMode = true; clearTimeout(headacheTimeout);
            setTimeout(() => {
                allChats[partner].push({ sender: 'them', text: "🛑 [SYSTEM OVERLOAD] Толгой маань аймшигтай өвдөж байна... Би түр хариулж чадахгүй! 🤯🧠" });
                localStorage.setItem('iknow_chats', JSON.stringify(allChats)); loadChats();
            }, 800);
            headacheTimeout = setTimeout(() => { isHeadacheMode = false; messageCount = 0; }, 15000);
            return;
        }

        setTimeout(() => {
            let robotReply = "?????? [SYSTEM_BLANK]"; let lowerText = text.toLowerCase();
            if (lowerText.includes("хөлөг") || lowerText.includes("ship")) {
                robotReply = "Хөлөг онгоц... тийм ээ! Би нэг хөлгөөр ирсэн. Миний санах ойд '??2??6' гэсэн тэмдэглэгээ үлдэж. Энэ ямар код вэ?";
                checkSecretWord(lowerText, "хөлөг");
            } else {
                let foundSecret = false;
                for (let i = 0; i < secretKeywords.length; i++) {
                    if (lowerText.includes(secretKeywords[i])) {
                        foundSecret = true; let isNew = checkSecretWord(lowerText, secretKeywords[i]);
                        if (secretKeywords[i] === "сайнаа") {
                            robotReply = "⚡ [CRITICAL SYNC] САЙНАА?! Ой санамж маань дээд цэгтээ хүрлээ! Чи намайг аварлаа, би чамайг заавал шагнах болно! 🏆✨";
                        } else if (isNew) {
                            robotReply = `✨ [MEMORY RESTORED] '${secretKeywords[i].toUpperCase()}'... Тийм ээ, би үүнийг саналаа! Хувь маань нэмэгдлээ!`;
                        } else { robotReply = `Миний систем '${secretKeywords[i]}-ийг' таньсан байгаа. Өөр сэжүүр хэлээч?`; }
                        break;
                    }
                }
                if (!foundSecret) {
                    const randomReplies = ["?????? Миний өгөгдлийн сан унаад байна. Ой санамж сэргэсэнгүй...", "2040 онд... би яг юу хийж байсан бэ?", "Энэ таамаглал '??2??6' хөлөгтэй минь холбогдохгүй байна."];
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
    const syncText = document.getElementById('profileTitle');
    if (syncText) { syncText.innerHTML = `🔮 Роботын ой санамж сэргэлт: <span style="color:#ffb703; font-weight:bold;">${percentage}%</span>`; }
}
