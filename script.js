// ========================================================
// PART 1: GLOBAL STATE & MULTI-LANGUAGE DICTIONARY
// ========================================================

// Application State Management (Local Storage)
let currentUser = null;
let databaseUsers = JSON.parse(localStorage.getItem('iknowtomorrow_users')) || [];
let timelinePosts = JSON.parse(localStorage.getItem('iknowtomorrow_posts')) || [];
let privateVaultLogs = JSON.parse(localStorage.getItem('iknowtomorrow_vault')) || [];
let selectedChatCitizen = null;

// Multi-language Text & Placeholder Dictionary (EN/MN)
const uiDictionary = {
    en: { /* ... Англи хэлний түлхүүр үгс ... */ },
    mn: { /* ... Монгол хэлний түлхүүр үгс ... */ }
};
const placeholderDictionary = {
    en: { /* ... Placeholder-ууд ... */ },
    mn: { /* ... Placeholder-ууд ... */ }
};

// Active System Language State
let appCurrentLanguage = 'en';
// ========================================================
// PART 2: TRANSLATION & LANGUAGE TOGGLE ENGINE
// ========================================================

// Function to open/close the language dropdown box
function toggleLanguageSelector() {
    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Function to translate the DOM content based on active language
function applyTranslations() {
    // Translate text content elements
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    // Translate placeholder elements
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (placeholderTranslations[currentLang] && placeholderTranslations[currentLang][key]) {
            input.setAttribute('placeholder', placeholderTranslations[currentLang][key]);
        }
    });

    // Update language indicator text on header button
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.innerText = `🌐 Language: ${currentLang.toUpperCase()}`;
    }
}

// Function to handle language switching triggered by UI dropdown clicks
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ik_lang', lang);
    applyTranslations();
    toggleLanguageSelector(); // Close dropdown after selection
}
// ========================================================
// PART 3: CORE NAVIGATION & INTERFACE CONTROL
// ========================================================

// Function to handle tab switching across the left navigation sidebar
function switchTab(tabName) {
    // Hide all viewports first
    const tabs = ['feed', 'chats', 'vault', 'ai'];
    tabs.forEach(tab => {
        const panel = document.getElementById(`tab-${tab}`);
        const btn = document.getElementById(`${tab}-btn`);
        if (panel) panel.style.display = 'none';
        if (btn) btn.classList.remove('active');
    });

    // Display targeted panel and set current button to active state
    const targetPanel = document.getElementById(`tab-${tabName}`);
    const targetBtn = document.getElementById(`${tabName}-btn`);
    if (targetPanel) targetPanel.style.display = 'block';
    if (targetBtn) targetBtn.classList.add('active');
}

// Function to safely switch between authentication cards (Login vs Register)
function showAuthPage(pageType) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    
    if (pageType === 'login') {
        if (loginCard) loginCard.style.display = 'block';
        if (registerCard) registerCard.style.display = 'none';
    } else if (pageType === 'register') {
        if (loginCard) loginCard.style.display = 'none';
        if (registerCard) registerCard.style.display = 'block';
    }
}

// Global utility helper to reveal/hide hidden passwords in input tags
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

// Resets application window state instantly back to home view
function resetAppToHome() {
    switchTab('feed');
}
// ========================================================
// PART 4: THEME MANAGEMENT & SYSTEM SETUP
// ========================================================

// Function to toggle between light and dark visual themes
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    
    if (body.classList.contains('theme-light')) {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        if (themeBtn) themeBtn.innerText = "🎨 Theme: DARK";
        localStorage.setItem('ik_theme', 'dark');
    } else {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        if (themeBtn) themeBtn.innerText = "🎨 Theme: LIGHT";
        localStorage.setItem('ik_theme', 'light');
    }
}

// Initialization event listener triggered when DOM tree finishes loading
document.addEventListener('DOMContentLoaded', () => {
    // Apply previously saved theme configuration
    const savedTheme = localStorage.getItem('ik_theme') || 'light';
    const themeBtn = document.getElementById('theme-btn');
    
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${savedTheme}`);
    if (themeBtn) {
        themeBtn.innerText = `🎨 Theme: ${savedTheme.toUpperCase()}`;
    }

    // Apply translations across all tagged interface components
    applyTranslations();
});
// ========================================================
// PART 5: AUTHENTICATION, SESSION & USER LIFECYCLE MANAGEMENT
// ========================================================

// Active user session state tracking object
let currentSessionUser = null;

// Function to safely execute new citizen account registration
function handleRegister(event) {
    event.preventDefault(); // Halt page reload to process parameters locally
    
    const regUsername = document.getElementById('reg-username').value.trim();
    const regPassword = document.getElementById('reg-password').value;

    // Check if the requested citizen profile moniker already exists in memory
    const userExists = globalUsers.some(user => user.username.toLowerCase() === regUsername.toLowerCase());
    if (userExists) {
        alert("This neural identity already exists within the timeline network.");
        return;
    }

    // Build fresh user profile structure with basic default assets
    const newCitizen = {
        id: "citizen_" + Date.now(),
        username: regUsername,
        password: regPassword, // Stored locally inside current sandbox perimeter
        avatar: "avatar.png"
    };

    globalUsers.push(newCitizen);
    localStorage.setItem('ik_users', JSON.stringify(globalUsers));
    
    alert("Neural Identity successfully generated. Proceeding to authentication layer.");
    showAuthPage('login');
}

// Function to handle core verification routine during system entrance
function handleLogin(event) {
    event.preventDefault(); // Terminate default form execution pipeline
    
    const loginUsername = document.getElementById('login-username').value.trim();
    const loginPassword = document.getElementById('login-password').value;

    // Search inside data perimeter for credentials match
    const authenticatedUser = globalUsers.find(user => 
        user.username.toLowerCase() === loginUsername.toLowerCase() && user.password === loginPassword
    );

    if (!authenticatedUser) {
        alert("Authentication failed. Invalid citizen credentials or access key.");
        return;
    }

    // Bind current user context to runtime global state variable
    currentSessionUser = authenticatedUser;

    // Shift interface display layout states to enter main application core
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';

    // Synchronize user interface profile elements with session context
    document.getElementById('profile-name').innerText = currentSessionUser.username;
    document.getElementById('profile-avatar').src = currentSessionUser.avatar;

    // Initialize core structural streams (implemented in later updates)
    if (typeof renderTimelineStream === 'function') renderTimelineStream();
    if (typeof populateOnlineCitizens === 'function') populateOnlineCitizens();
}

// Function to clear credential tokens and return instantly to login screen
function handleLogout() {
    currentSessionUser = null;
    
    // Clear credential target input form text structures cleanly
    document.getElementById('login-username').value = "";
    document.getElementById('login-password').value = "";

    // Reset visibility configurations back onto container screens
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    showAuthPage('login');
}
// ========================================================
// PART 6: IDENTITY PROFILE & AVATAR MODIFICATION MATRIX
// ========================================================

// Temp variable to store base64 string during file uploading phase
let temporaryAvatarBase64 = null;

// Function to activate neural modification popup window modal
function triggerAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal && currentSessionUser) {
        modal.style.display = 'flex';
        // Populate inputs with current credentials
        document.getElementById('modal-username-input').value = currentSessionUser.username;
        document.getElementById('modal-avatar-preview-tag').src = currentSessionUser.avatar;
        temporaryAvatarBase64 = null; // Clear previously buffered changes
    }
}

// Function to terminate modal visibility configurations instantly
function closeAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal) modal.style.display = 'none';
}

// Intercept local disk asset selection streams and process binary file
function handleModalAvatarSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        temporaryAvatarBase64 = e.target.result;
        // Inject visual data stream straight to modal avatar tag
        document.getElementById('modal-avatar-preview-tag').src = temporaryAvatarBase64;
    };
    reader.readAsDataURL(file);
}

// Function to commit updated moniker and avatar data to internal storage
function saveModalAvatar() {
    if (!currentSessionUser) return;

    const newName = document.getElementById('modal-username-input').value.trim();
    if (!newName) {
        alert("Moniker field cannot materialize as empty space.");
        return;
    }

    // Mutate username properties inside current memory instance
    currentSessionUser.username = newName;
    
    // Inject temporary avatar asset if modifications were buffered
    if (temporaryAvatarBase64) {
        currentSessionUser.avatar = temporaryAvatarBase64;
    }

    // Propagate alterations back into global state container array
    globalUsers = globalUsers.map(user => user.id === currentSessionUser.id ? currentSessionUser : user);
    localStorage.setItem('ik_users', JSON.stringify(globalUsers));

    // Render configuration changes instantly across app header components
    document.getElementById('profile-name').innerText = currentSessionUser.username;
    document.getElementById('profile-avatar').src = currentSessionUser.avatar;

    // Refresh dependencies inside secondary channels
    if (typeof renderTimelineStream === 'function') renderTimelineStream();
    if (typeof populateOnlineCitizens === 'function') populateOnlineCitizens();

    closeAvatarModal();
}
// ========================================================
// PART 7: FUTURE FEED PIPELINE & MEDIA STREAMING SYSTEM
// ========================================================

// Storage variables for raw base64 data generated via composer attachment pipelines
let attachedMediaDataUrl = null;
let attachedMediaType = null; // Stores either 'image' or 'video' structures

// Intercepts local system storage attachment selections from composition panels
function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        attachedMediaDataUrl = e.target.result;
        attachedMediaType = type;

        // Display configuration triggers for container preview panels
        document.getElementById('post-media-preview-box').style.display = 'block';
        const imgTag = document.getElementById('post-image-preview-img');
        const vidTag = document.getElementById('post-video-preview-vid');

        if (type === 'image') {
            imgTag.src = attachedMediaDataUrl;
            imgTag.style.display = 'block';
            vidTag.style.display = 'none';
        } else if (type === 'video') {
            vidTag.src = attachedMediaDataUrl;
            vidTag.style.display = 'block';
            imgTag.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// Clears all currently staged binary attachments inside composition engine variables
function clearAttachedMedia() {
    attachedMediaDataUrl = null;
    attachedMediaType = null;
    
    // Clear DOM file input targets
    document.getElementById('post-image-file').value = "";
    document.getElementById('post-video-file').value = "";
    
    // Hide visibility nodes
    document.getElementById('post-image-preview-img').style.display = 'none';
    document.getElementById('post-video-preview-vid').style.display = 'none';
    document.getElementById('post-media-preview-box').style.display = 'none';
}
// ========================================================
// PART 8: VISION PUBLICATION, RENDERING & TIMELINE SEARCH
// ========================================================

// Function to construct and save a new vision post to the timeline
function createPost() {
    if (!currentSessionUser) {
        alert("You must be authenticated to broadcast your vision to the network.");
        return;
    }

    const textContent = document.getElementById('future-input').value.trim();
    if (!textContent && !attachedMediaDataUrl) {
        alert("Your broadcast container is empty. Please enter code parameters or attach media files.");
        return;
    }

    // Assemble unified post structure
    const newPost = {
        id: "post_" + Date.now(),
        userId: currentSessionUser.id,
        username: currentSessionUser.username,
        avatar: currentSessionUser.avatar,
        content: textContent,
        media: attachedMediaDataUrl,
        mediaType: attachedMediaType,
        timestamp: new Date().toLocaleString()
    };

    globalPosts.unshift(newPost); // Push into front of stream for instant rendering
    localStorage.setItem('ik_posts', JSON.stringify(globalPosts));

    // Clear content panels inside composition card
    document.getElementById('future-input').value = "";
    clearAttachedMedia();

    // Re-render feed instantly
    renderTimelineStream();
}

// Function to paint the timeline data dynamically into the HTML viewport
function renderTimelineStream(filteredPosts = null) {
    const container = document.getElementById('feed-container');
    if (!container) return;

    container.innerHTML = ""; // Flush stream content
    const postsToRender = filteredPosts || globalPosts;

    if (postsToRender.length === 0) {
        container.innerHTML = `<div class="empty-timeline-notice">No future signals detected inside this timeline corridor.</div>`;
        return;
    }

    postsToRender.forEach(post => {
        let mediaTag = "";
        if (post.media) {
            if (post.mediaType === 'image') {
                mediaTag = `<img src="${post.media}" class="timeline-attached-img" style="max-width:100%; border-radius:12px; margin-top:12px;">`;
            } else if (post.mediaType === 'video') {
                mediaTag = `<video src="${post.media}" class="timeline-attached-vid" controls style="max-width:100%; border-radius:12px; margin-top:12px;"></video>`;
            }
        }

        const postCard = document.createElement('div');
        postCard.className = "timeline-post-card";
        postCard.style = "border: 1px solid var(--border-color); padding: 16px; border-radius: 12px; margin-bottom: 16px; background: var(--bg-card);";
        postCard.innerHTML = `
            <div class="post-header-node" style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <img src="${post.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                <div>
                    <h4 style="margin:0; font-weight:600;">${post.username}</h4>
                    <small style="opacity:0.6;">${post.timestamp}</small>
                </div>
            </div>
            <p style="margin:0; white-space:pre-wrap; line-height:1.5;">${post.content}</p>
            ${mediaTag}
        `;
        container.appendChild(postCard);
    });
}

// Filter the active stream pipeline based on query inputs from search box
function searchPosts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) {
        renderTimelineStream(); // Restore full channel defaults
        return;
    }

    const filtered = globalPosts.filter(post => 
        post.username.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query)
    );
    renderTimelineStream(filtered);
}
// ========================================================
// PART 9: ENCRYPTED CHAT NETWORK ARCHITECTURE
// ========================================================

// Local chat history dictionary database schema
let globalChatHistory = JSON.parse(localStorage.getItem('ik_chats')) || {};

// Function to compile and display all registered network participants
function populateOnlineCitizens() {
    const listContainer = document.getElementById('friends-list-container');
    if (!listContainer || !currentSessionUser) return;

    listContainer.innerHTML = ""; // Clear existing listing tree

    // Filter out current active authenticated profile context
    const peers = globalUsers.filter(user => user.id !== currentSessionUser.id);

    if (peers.length === 0) {
        listContainer.innerHTML = `<div style="padding:12px; opacity:0.6; font-size:14px;">No other citizens online inside this node.</div>`;
        return;
    }

    peers.forEach(peer => {
        const peerItem = document.createElement('div');
        peerItem.className = `citizen-chat-node ${activeChatPartnerId === peer.id ? 'active' : ''}`;
        peerItem.style = `display:flex; align-items:center; gap:12px; padding:12px; border-radius:8px; cursor:pointer; margin-bottom:8px; border:1px solid var(--border-color);`;
        if (activeChatPartnerId === peer.id) peerItem.style.background = "rgba(0, 255, 200, 0.1)"; // Neon feedback hint
        
        peerItem.innerHTML = `
            <img src="${peer.avatar}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
            <span style="font-weight:600;">${peer.username}</span>
        `;
        
        peerItem.onclick = () => selectChatPartner(peer.id);
        listContainer.appendChild(peerItem);
    });
}

// Target specified participant identity to channel active transmission
function selectChatPartner(peerId) {
    activeChatPartnerId = peerId;
    const targetUser = globalUsers.find(u => u.id === peerId);
    
    if (targetUser) {
        document.getElementById('active-chat-partner').innerText = `💬 Encrypted Link: ${targetUser.username}`;
        renderChatMessagesStream();
        populateOnlineCitizens(); // Re-render for visual active states feedback
    }
}

// Paint local structural communications historical arrays directly to screen viewports
function renderChatMessagesStream() {
    const stream = document.getElementById('friends-chat-messages');
    if (!stream || !currentSessionUser || !activeChatPartnerId) return;

    stream.innerHTML = ""; // Flush stream content

    // Build unique tracking key formula based on identity sorting protocols
    const channelKey = [currentSessionUser.id, activeChatPartnerId].sort().join("_");
    const thread = globalChatHistory[channelKey] || [];

    thread.forEach(msg => {
        const row = document.createElement('div');
        row.style = `display:flex; margin-bottom:12px; width:100%; justify-content:${msg.senderId === currentSessionUser.id ? 'flex-end' : 'flex-start'};`;
        
        const textBubble = document.createElement('div');
        textBubble.style = `max-width:70%; padding:10px 14px; border-radius:12px; line-height:1.4; word-break:break-word;
            background: ${msg.senderId === currentSessionUser.id ? 'rgba(0, 255, 200, 0.2)' : 'var(--bg-main)'};
            border: 1px solid ${msg.senderId === currentSessionUser.id ? '#00ffc8' : 'var(--border-color)'};`;
        
        textBubble.innerText = msg.text;
        row.appendChild(textBubble);
        stream.appendChild(row);
    });

    stream.scrollTop = stream.scrollHeight; // Force scroll interface downwards
}

// Function to append and save secure payload data matrices to specific profiles
function sendFriendMessage() {
    const input = document.getElementById('friends-chat-input');
    if (!input || !currentSessionUser || !activeChatPartnerId) return;

    const payloadText = input.value.trim();
    if (!payloadText) return;

    const channelKey = [currentSessionUser.id, activeChatPartnerId].sort().join("_");
    if (!globalChatHistory[channelKey]) globalChatHistory[channelKey] = [];

    const newMsg = {
        senderId: currentSessionUser.id,
        text: payloadText,
        timestamp: Date.now()
    };

    globalChatHistory[channelKey].push(newMsg);
    localStorage.setItem('ik_chats', JSON.stringify(globalChatHistory));

    input.value = ""; // Erase interaction line text blocks cleanly
    renderChatMessagesStream();
}
// ========================================================
// PART 10: PRIVATE VAULT LOG, ARTIST AI SANDBOX & BOOT
// ========================================================

let temporaryVaultImageBase64 = null;

// Intercept file loading workflows inside private calendar configurations
function handleVaultImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        temporaryVaultImageBase64 = e.target.result;
        document.getElementById('vault-image-preview-box').style.display = 'block';
        document.getElementById('vault-img-preview-tag').src = temporaryVaultImageBase64;
    };
    reader.readAsDataURL(file);
}

// Disconnect configuration metrics inside target vault asset arrays
function clearVaultImageSelect() {
    temporaryVaultImageBase64 = null;
    document.getElementById('vault-image-file').value = "";
    document.getElementById('vault-image-preview-box').style.display = 'none';
}

// Packages text inputs and writes structural nodes onto local storage banks
function saveVaultCalendar() {
    if (!currentSessionUser) return;

    const dateVal = document.getElementById('vault-date-input').value;
    const logText = document.getElementById('vault-calendar-text').value.trim();

    if (!dateVal || !logText) {
        alert("Encryption failed. Both historical timestamp markers and target logs must be present.");
        return;
    }

    const newLog = {
        id: "vault_" + Date.now(),
        userId: currentSessionUser.id,
        date: dateVal,
        content: logText,
        securePhoto: temporaryVaultImageBase64
    };

    globalVaultLogs.unshift(newLog);
    localStorage.setItem('ik_vault', JSON.stringify(globalVaultLogs));

    // Clear structural panel properties cleanly
    document.getElementById('vault-date-input').value = "";
    document.getElementById('vault-calendar-text').value = "";
    clearVaultImageSelect();

    renderVaultRecordsStream();
}

// Render secure nodes onto structural dashboard panels
function renderVaultRecordsStream() {
    const list = document.getElementById('vault-calendar-list');
    if (!list || !currentSessionUser) return;

    list.innerHTML = "";
    const internalLogs = globalVaultLogs.filter(log => log.userId === currentSessionUser.id);

    if (internalLogs.length === 0) {
        list.innerHTML = `<div style="opacity:0.6; font-size:14px; padding:12px;">No encrypted operations logged within this perimeter.</div>`;
        return;
    }

    internalLogs.forEach(log => {
        let photoTag = log.securePhoto ? `<img src="${log.securePhoto}" style="max-width:100%; border-radius:8px; margin-top:8px; border:1px dashed rgba(255,255,255,0.2);">` : "";
        const row = document.createElement('div');
        row.style = "border:1px dashed var(--border-color); padding:12px; border-radius:8px; margin-bottom:12px; background:rgba(0,0,0,0.2);";
        row.innerHTML = `
            <div style="font-weight:600; color:#00ffc8; font-size:12px; margin-bottom:6px;">TIMESTAMP: ${log.date}</div>
            <p style="margin:0; font-size:14px; line-height:1.4;">${log.content}</p>
            ${photoTag}
        `;
        list.appendChild(row);
    });
}

// Simulated Artist AI Image pipeline logic parameters
function generateAIImage() {
    const prompt = document.getElementById('ai-prompt-input').value.trim();
    const resultBox = document.getElementById('ai-image-result');
    if (!prompt || !resultBox) return;

    resultBox.innerHTML = `<div style="opacity:0.6;" class="ai-loading">Deploying neural brushes... Rendering matrix corridors...</div>`;

    setTimeout(() => {
        // Choose random asset profile index to simulate custom matrix rendering mechanics
        const mockArray = ["r1.webp", "r2.jpg", "r4.jpg", "r6.jpg", "r7.jpg"];
        const fallbackAsset = mockArray[Math.floor(Math.random() * mockArray.length)];
        
        resultBox.innerHTML = `
            <div style="margin-top:16px; text-align:center;">
                <h4 style="color:#00ffc8; font-size:12px; margin-bottom:8px;">GENERATED TIMELINE CORRIDOR</h4>
                <img src="${fallbackAsset}" style="max-width:100%; border-radius:12px; border:2px solid #00ffc8; box-shadow: 0 0 15px rgba(0,255,200,0.4);">
            </div>
        `;
    }, 2200);
}

// System initialization function override hooks
window.addEventListener('load', () => {
    // Inject system execution parameters inside interface event loops
    console.log("iKnowTomorrow Core Framework Initialized.");
});
