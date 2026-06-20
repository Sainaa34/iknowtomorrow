// 🔐 АРЫН ЗУРГУУД БОЛОН НЭВТРЭХ СИСТЕМ
const authImages = [
    'Designer (1).png', 'Designer (2).png', 'Designer (3).png', 
    'Designer (4).png', 'Designer (5).png', 'Designer (6).png', 
    'Designer (7).png', 'Designer (8).png', 'Designer (9).png', 
    'Designer (10).png', 'Designer.png'
];

function initAuthPage() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    
    // Зургуудыг санамсаргүйгээр холих
    let shuffled = [...authImages].sort(() => 0.5 - Math.random());
    
    // Арын дэвсгэр болон картуудад зургийг оноох
    authContainer.style.backgroundImage = `url('${shuffled[0]}')`;
    authContainer.style.backgroundSize = 'cover';
    authContainer.style.backgroundPosition = 'center';
    
    if (document.getElementById('login-card')) {
        document.getElementById('login-card').style.backgroundImage = `url('${shuffled[1]}')`;
        document.getElementById('login-card').style.backgroundSize = 'cover';
    }
    if (document.getElementById('register-card')) {
        document.getElementById('register-card').style.backgroundImage = `url('${shuffled[2]}')`;
        document.getElementById('register-card').style.backgroundSize = 'cover';
    }
}

function showAuthPage(type) {
    document.getElementById('login-card').style.display = type === 'register' ? 'none' : 'block';
    document.getElementById('register-card').style.display = type === 'register' ? 'block' : 'none';
}
