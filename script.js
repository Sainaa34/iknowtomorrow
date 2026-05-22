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

document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI(); loadPosts(); loadChats();
});

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
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

    const select = document.getElementById('categorySelect');
    select.innerHTML = '';
    t.categories.forEach(cat => {
        const opt = document.createElement('option'); opt.value = cat; opt.innerText = cat; select.appendChild(opt);
    });
}

function updateProfileName() {
    document.getElementById('profileName').innerText = document.getElementById('userSelect').value;
}

function createPost() {
    const content = document.getElementById('postInput').value.trim();
    const category = document.getElementById('categorySelect').value;
    const user = document.getElementById('userSelect').value;
    if(!content) { alert(translations[currentLang].alert); return; }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newPost = { id: Date.now(), user: user, category: category, content: content, time: formattedDate, likes: 0, comments: [] };
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts.unshift(newPost); localStorage.setItem('iknow_posts', JSON.stringify(posts));
    document.getElementById('postInput').value = ''; renderPosts();
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('iknow_posts'));
    if(!posts) {
        posts = [{ id: 1, user: "Sainaa", category: "🤖 Хиймэл оюун ухаан (AI)", content: "2030 он гэхэд энэ сошиал сайт дээр хүмүүс тархиараа холбогдож пост оруулдаг болох байх даа!", time: "2026/05/22 19:45", likes: 5, comments: ["Үнэхээр гайхалтай зөгнөл байна! 🔥"] }];
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
        container.innerHTML += `
            <div class="post">
                <button class="delete-btn" onclick="deletePost(${post.id})">✕</button>
                <div class="post-header"><span class="post-user">👤 ${post.user}</span><span class="badge">${post.category}</span></div>
                <div class="post-time">📅 ${post.time}</div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost(${post.id})">❤️ <span>${post.likes || 0}</span></button>
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

function renderMyPosts() {
    const container = document.getElementById('myPostsContainer');
    const posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const currentUser = document.getElementById('userSelect').value;
    const myPosts = posts.filter(p => p.user === currentUser); container.innerHTML = '';
    if(myPosts.length === 0) { container.innerHTML = `<p style="color:#8a8d91; text-align:center;">Одоогоор нийтлэл байхгүй байна.</p>`; return; }
    myPosts.forEach(post => {
        container.innerHTML += `<div class="post"><div class="post-header"><span class="badge">${post.category}</span></div><div class="post-time">📅 ${post.time}</div><div class="post-content">${post.content}</div></div>`;
    });
}

function likePost(postId) {
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    const idx = posts.findIndex(p => p.id === postId);
    if(idx !== -1) { posts[idx].likes = (posts[idx].likes || 0) + 1; localStorage.setItem('iknow_posts', JSON.stringify(posts)); renderPosts(); }
}

// Пост устгах хэсэг
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
}

function loadChats() {
    const partner = document.getElementById('chatPartner').value; const chatMessages = document.getElementById('chatMessages'); chatMessages.innerHTML = '';
    let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    let currentChat = allChats[partner] || [{ sender: 'them', text: "Сайн уу! Маргаашийн технологийн талаар ярилцах уу? 🚀" }];
    currentChat.forEach(msg => {
        const div = document.createElement('div'); div.classList.add('msg', msg.sender === 'me' ? 'sent' : 'received'); div.innerText = msg.text; chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendDirectMessage() {
    const input = document.getElementById('chatInput'); const text = input.value.trim(); if(!text) return;
    const partner = document.getElementById('chatPartner').value; let allChats = JSON.parse(localStorage.getItem('iknow_chats')) || {};
    if(!allChats[partner]) allChats[partner] = [{ sender: 'them', text: "Сайн уу! Маргаашийн технологийн талаар ярилцах уу? 🚀" }];
    allChats[partner].push({ sender: 'me', text: text }); localStorage.setItem('iknow_chats', JSON.stringify(allChats));
    input.value = ''; loadChats();
    if(partner.includes("Bot")) {
        setTimeout(() => {
            allChats[partner].push({ sender: 'them', text: "Ирээдүйг зөгнөсөн гайхалтай мессеж байна! Би үүнийг датабаздаа хадгаллаа. 🤖✨" });
            localStorage.setItem('iknow_chats', JSON.stringify(allChats)); loadChats();
        }, 1000);
    }
}
