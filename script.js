const translations = {
    mn: {
        placeholder: "Ирээдүйд юу болох бол? Энд хуваалц... (Таг нэмж болно #ai)",
        submit: "Нийтлэх", commentPlaceholder: "Сэтгэгдэл бичих...",
        send: "Илгээх", alert: "Зөгнөлөө бичнэ үү, эсвэл хууль бус үг ашиглаж болохгүй шүү!",
        myPosts: "📌 Миний оруулсан зөгнөлүүд", chatWith: "Хэнтэй чатлах: ",
        chatPlaceholder: "Мессеж бичих...",
        categories: ["🤖 Хиймэл оюун ухаан (AI)", "🚀 Ирээдүйн Технологи", "🔮 Зүүд ба Зөн совин", "👽 Харийн гариг", "🦾 Хиймэл эрхтэн / Киборг"]
    },
    en: {
        placeholder: "What will happen in the future? Share here... (#ai)",
        submit: "Post", commentPlaceholder: "Write a comment...",
        send: "Send", alert: "Please write valid content without banned words!",
        myPosts: "📌 My Predictions", chatWith: "Chat with: ",
        chatPlaceholder: "Type a message...",
        categories: ["🤖 Artificial Intelligence (AI)", "🚀 Future Technology", "🔮 Dreams & Intuition", "👽 Aliens & Outer Space", "🦾 Artificial Organs / Cyborg"]
    }
};

let currentLang = localStorage.getItem('iknow_lang') || 'mn';
let attachedMediaBase64 = "";
let attachedMediaType = ""; 
let selectedTagFilter = "";

const secretKeywords = ["2026", "хөлөг", "тархи", "сансар", "зүүд", "хиймэл", "энерги", "цаг хугацаа", "сайнаа"];
// ХУУЛИЙН БУС БАНДСАН ҮГСИЙН ЖАГСААЛТ (MODERATION)
const bannedKeywords = ["porn", "порно", "секс", "sex", "казино", "casino", "мөрийтэй", "1xbet", "pussy", "dick", "хөх", "боожгой"];

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

// МЕДИА УРДЧИЛЖ ХАРАХ (ЗУРАГ ЖИШЭЭ БОЛОН БИЧЛЭГ)
function previewPostMedia(type) {
    const inputId = type === 'image' ? 'postImageInput' : 'postVideoInput';
    const file = document.getElementById(inputId).files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            attachedMediaBase64 = e.target.result;
            attachedMediaType = type;
            const container = document.getElementById('mediaPreviewContainer');
            if (type === 'image') {
                container.innerHTML = `<img src="${attachedMediaBase64}" style="max-width:150px; margin-top:10px; border-radius:8px;">`;
            } else {
                container.innerHTML = `<video src="${attachedMediaBase64}" controls style="max-width:200px; margin-top:10px; border-radius:8px;"></video>`;
            }
        }
        reader.readAsDataURL(file);
    }
}

function createPost() {
    const content = document.getElementById('postInput').value.trim();
    const category = document.getElementById('categorySelect').value;
    const user = document.getElementById('userSelect').value;

    // УХААЛАГ КОНТЕНТ ХЯНАЛТ (ХУУЛИЙН БУС КОНТЕНТ ШҮҮХ)
    let lowerContent = content.toLowerCase();
    let hasBannedWord = bannedKeywords.some(word => lowerContent.includes(word));
    
    if (hasBannedWord) {
        alert("🚨 [SECURITY WARNING] Хууль бус контент (Садар самуун, Мөрийтэй тоглоом) нийтлэхийг хориглоно! Таны постыг устгалаа.");
        document.getElementById('postInput').value = '';
        return;
    }

    if(!content && !attachedMediaBase64) { alert(translations[currentLang].alert); return; }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newPost = { 
        id: Date.now(), user: user, category: category, content: content, time: formattedDate, 
        likes: 0, wows: 0, omgs: 0, comments: [], 
        media: attachedMediaBase64, mediaType: attachedMediaType 
    };
    
    let posts = JSON.parse(localStorage.getItem('iknow_posts')) || [];
    posts.unshift(newPost); localStorage.setItem('iknow_posts', JSON.stringify(posts));
    
    document.getElementById('postInput').value = '';
    document.getElementById('postImageInput').value = '';
    document.getElementById('postVideoInput').value = '';
    document.getElementById('mediaPreviewContainer').innerHTML = '';
    attachedMediaBase64 = ""; attachedMediaType = "";
    renderPosts();
}
