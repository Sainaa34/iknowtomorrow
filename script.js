// 🪐 GLOBAL STATE / ДАТА ХАДГАЛАХ ХЭСЭГ
let currentUser = null;
let posts = JSON.parse(localStorage.getItem('cyber_posts')) || [];
let users = JSON.parse(localStorage.getItem('cyber_users')) || [];
let activeChatPartner = null;

// 🖼️ НЭВТРЭХ ХҮҮДЭСНИЙ 3 ТАЛЫН ЗУРГУУД
const authImages = [
    'Designer (1).png', 'Designer (2).png', 'Designer (3).png',
    'Designer (4).png', 'Designer (5).png', 'Designer (6).png',
    'Designer (7).png', 'Designer (8).png', 'Designer (9).png',
    'Designer (10).png', 'Designer.png'
];

// 🔄 ХҮҮДЭС АЧААЛАГДАХАД АЖИЛЛАХ
window.onload = function() {
    initAuthPage();
    checkLoginStatus();
};

// 🔐 НЭВТРЭХ ХҮҮДЭСНИЙ ЗУРГУУДЫГ ОНООХ
function initAuthPage() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    // Санамсаргүй 3 өөр зураг сонгох
    let shuffled = [...authImages].sort(() => 0.5 - Math.random());
    let leftImg = shuffled[0];
    let rightImg = shuffled[1];
    let centerImg = shuffled[2];

    // CSS рүү зургуудыг зөв дарааллаар илгээх
    authContainer.style.backgroundImage = `url('${leftImg}'), url('${rightImg}'), url('${centerImg}')`;
    
    // Голын картыг тод харуулах арын зураг
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (loginCard) loginCard.style.backgroundImage = `url('${centerImg}')`;
    if (registerCard) registerCard.style.backgroundImage = `url('${centerImg}')`;
}

// 🔀 НЭВТРЭХ БОЛОН БҮРТГҮҮЛЭХ ХЭСГИЙГ СОЛИХ
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

// 📝 БҮРТГҮҮЛЭХ ФУНКЦ
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!username || !password) return alert('Мэдээллээ бүрэн бөглөнө үү!');
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return alert('Энэ нэр аль хэдийн бүртгэгдсэн байна!');
    }

    const newUser = {
        username: username,
        password: password,
        avatar: 'Designer.png' // default avatar
    };

    users.push(newUser);
    localStorage.setItem('cyber_users', JSON.stringify(users));
    alert('Амжилттай бүртгэгдлээ! Одоо нэвтэрч орно уу.');
    showAuthPage('login');
}

// 🔑 НЭВТРЭХ ФУНКЦ
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('cyber_current_user', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Хэрэглэгчийн нэр эсвэл нууц үг буруу байна!');
    }
}

// 🚪 ГАРАХ ФУНКЦ
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('cyber_current_user');
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    initAuthPage();
}

// 🛡️ НЭВТРЭСЭН ЭСЭХИЙГ ШАЛГАХ
function checkLoginStatus() {
    const savedUser = localStorage.getItem('cyber_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
}

// 🛸 ҮНДСЭН АПП-ЫГ ХАРУУЛАХ
function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Профайл шинэчлэх
    document.getElementById('profile-name').innerText = currentUser.username;
    document.getElementById('profile-avatar').src = currentUser.avatar;
    
    renderFeed();
    renderFriends();
}

// 📑 ТАБ СОЛИХ
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.menu-tab').forEach(el => el.classList.remove('active'));

    if (tabName === 'feed') {
        document.getElementById('tab-feed').style.display = 'block';
        document.getElementById('feed-btn').classList.add('active');
    } else if (tabName === 'friends') {
        document.getElementById('tab-friends').style.display = 'block';
        document.getElementById('friends-btn').classList.add('active');
    } else if (tabName === 'chat') {
        document.getElementById('tab-chat').style.display = 'block';
        document.getElementById('chats-btn').classList.add('active');
    }
}

// ✍️ ПОСТ УСТГАХ СИСТЕМ
function createPost() {
    const text = document.getElementById('future-input').value.trim();
    if (!text) return alert('Пост хоосон байж болохгүй!');

    const newPost = {
        id: 'post_' + Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatar,
        text: text,
        time: 'Just now',
        votes: 0,
        voters: [],
        comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem('cyber_posts', JSON.stringify(posts));
    document.getElementById('future-input').value = '';
    renderFeed();
}

// 🔄 ТАЙМЛАЙН ХАРУУЛАХ (RENDER)
function renderFeed(filterData = null) {
    const container = document.getElementById('feed-container');
    container.innerHTML = '';
    const displayPosts = filterData || posts;

    displayPosts.forEach(post => {
        let tierClass = 'tier-electric';
        if (post.votes >= 10) tierClass = 'tier-matrix';
        else if (post.votes >= 5) tierClass = 'tier-fire';

        // Өөрийнх нь пост мөн бол устгах товч харуулах
        let deleteBtnHtml = post.author === currentUser.username ? 
            `<button class="delete-btn-red" onclick="deletePost('${post.id}')">❌ Устгах</button>` : '';

        let commentsHtml = post.comments.map(c => `
            <div style="font-size:12px; margin-top:5px; background:rgba(255,255,255,0.05); padding:5px; border-radius:4px;">
                <strong>${c.author}:</strong> ${c.text}
            </div>
        `).join('');

        const card = document.createElement('div');
        card.className = `post-card ${tierClass}`;
        card.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-info">
                    <img class="post-avatar-mini" src="${post.avatar}">
                    <div class="post-meta-text">
                        <h4>${post.author}</h4>
                        <span>${post.time}</span>
                    </div>
                </div>
                <div class="post-header-actions">
                    <button class="vote-btn-neon" onclick="votePost('${post.id}')">⚡ Sync (${post.votes})</button>
                    <div class="post-menu-container">
                        <button class="post-more-btn" onclick="togglePostMenu('${post.id}')">⋮</button>
                        <div id="menu-${post.id}" class="post-dropdown-menu">
                            ${deleteBtnHtml}
                            <button onclick="alert('Timeline Synced!')">🔗 Share</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-main-text">${post.text}</div>
            <div class="comments-section">
                ${commentsHtml}
                <div class="comment-input-row">
                    <input id="reply-${post.id}" type="text" placeholder="Write a comment...">
                    <button class="comment-add-btn" onclick="addComment('${post.id}')">➔</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function togglePostMenu(id) {
    const menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function deletePost(id) {
    if (confirm('Энэ постыг устгах уу?')) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('cyber_posts', JSON.stringify(posts));
        renderFeed();
    }
}

function votePost(id) {
    const post = posts.find(p => p.id === id);
    if (!post.voters) post.voters = [];
    
    if (post.voters.includes(currentUser.username)) {
        post.votes--;
        post.voters = post.voters.filter(v => v !== currentUser.username);
    } else {
        post.votes++;
        post.voters.push(currentUser.username);
    }
    localStorage.setItem('cyber_posts', JSON.stringify(posts));
    renderFeed();
}

function addComment(id) {
    const input = document.getElementById(`reply-${id}`);
    const text = input.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === id);
    post.comments.push({
        author: currentUser.username,
        text: text
    });

    localStorage.setItem('cyber_posts', JSON.stringify(posts));
    input.value = '';
    renderFeed();
}

// 🔍 ХАЙЛТ СИСТЕМ
function searchPosts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = posts.filter(p => p.text.toLowerCase().includes(query) || p.author.toLowerCase().includes(query));
    renderFeed(filtered);
}

// 🤝 ХОЛБОГДСОН ИРГЭД (FRIENDS)
function renderFriends() {
    const container = document.getElementById('friends-list-container');
    container.innerHTML = '';
    
    users.forEach(u => {
        if (u.username === currentUser.username) return;
        const row = document.createElement('div');
        row.className = `friend-item-row ${activeChatPartner === u.username ? 'active' : ''}`;
        row.onclick = () => startChat(u.username);
        row.innerHTML = `
            <img class="friend-avatar-mini" src="${u.avatar}">
            <span>${u.username}</span>
        `;
        container.appendChild(row);
    });
}

function startChat(name) {
    activeChatPartner = name;
    document.getElementById('active-chat-partner').innerText = `💬 Syncing with ${name}`;
    renderFriends();
    // Хуурамч чат түүх ачаалах
    const msgBox = document.getElementById('friends-chat-messages');
    msgBox.innerHTML = `<div class="msg-row friend-msg"><strong>${name}:</strong> Secure connection built. Say something.</div>`;
}

function sendFriendMessage() {
    const input = document.getElementById('friends-chat-input');
    const text = input.value.trim();
    if (!text || !activeChatPartner) return;

    const msgBox = document.getElementById('friends-chat-messages');
    msgBox.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${text}</div>`;
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;
}

// 🤖 FUTURE BOT CHAT
function sendDirectMessage() {
    const input = document.getElementById('bot-input');
    const text = input.value.trim();
    if (!text) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg-row user"><strong>You:</strong> ${text}</div>`;
    input.value = '';

    setTimeout(() => {
        container.innerHTML += `<div class="msg-row bot"><strong>Future Bot:</strong> Timeline analysis complete. In 2040, your action will trigger quantum leap.</div>`;
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

// ⚙️ PROFILE MODAL SYSTEMS WITH HISTORY
function openProfileModal() {
    document.getElementById('profile-modal').style.display = 'flex';
    document.getElementById('modal-username').value = currentUser.username;
    document.getElementById('modal-avatar').value = currentUser.avatar;
    renderProfileHistory();
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

function saveProfileModal() {
    const newName = document.getElementById('modal-username').value.trim();
    const newAvatar = document.getElementById('modal-avatar').value.trim();

    if (!newName) return alert('Username cannot be empty!');

    currentUser.username = newName;
    currentUser.avatar = newAvatar || 'Designer.png';

    // Update main array
    users = users.map(u => u.username === currentUser.username ? currentUser : u);
    localStorage.setItem('cyber_users', JSON.stringify(users));
    localStorage.setItem('cyber_current_user', JSON.stringify(currentUser));

    alert('Identity Profile Synced!');
    closeProfileModal();
    showMainApp();
}

// 📝 ПРОФАЙЛ ДОТОР ТҮҮХИЙГ УНШИЖ ХАРУУЛАХ
function renderProfileHistory() {
    const postsBox = document.getElementById('profile-posts-history');
    const commentsBox = document.getElementById('profile-comments-history');

    // Миний постууд шүүх
    const myPosts = posts.filter(p => p.author === currentUser.username);
    postsBox.innerHTML = myPosts.length ? myPosts.map(p => `
        <div style="border-bottom:1px solid #222; padding:4px 0; color:#fff;">⚡ ${p.text.substring(0, 40)}...</div>
    `).join('') : '<span style="color:#666;">Пост байхгүй байна.</span>';

    // Миний сэтгэгдлүүд шүүх
    let myCommentsCount = 0;
    let commentsHtml = '';
    posts.forEach(p => {
        p.comments.forEach(c => {
            if (c.author === currentUser.username) {
                myCommentsCount++;
                commentsHtml += `<div style="border-bottom:1px solid #222; padding:4px 0; color:#fff;">💬 ${c.text.substring(0, 40)}... <small style="color:var(--cyber-cyan)">(${p.author}-ий постон дээр)</small></div>`;
            }
        });
    });
    commentsBox.innerHTML = myCommentsCount ? commentsHtml : '<span style="color:#666;">Сэтгэгдэл байхгүй байна.</span>';
}

// 🎨 СЭДЭВ СОЛИХ (THEME TOGGLE)
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    if (body.classList.contains('theme-cyber')) {
        body.className = 'theme-matrix';
        btn.innerText = '🎨 Theme: Matrix';
    } else if (body.classList.contains('theme-matrix')) {
        body.className = 'theme-dark';
        btn.innerText = '🎨 Theme: Dark';
    } else {
        body.className = 'theme-cyber';
        btn.innerText = '🎨 Theme: Cyber';
    }
}
