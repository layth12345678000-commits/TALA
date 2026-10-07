/** 
 * ========================================================
 * 1. وضع الاختبار وتاريخ العداد (29 أكتوبر)
 * ========================================================
 */
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('test') === 'true'; 

const targetDate = new Date();
targetDate.setMonth(9); // شهر أكتوبر (نظام البرمجة يبدأ من 0، لذلك 9 تعني 10)
targetDate.setDate(29);
targetDate.setHours(0, 0, 0, 0);

// إذا انتهى تاريخ 29 أكتوبر، نضبط العداد للعام القادم (ما لم نكن في وضع الاختبار)
if (new Date() > targetDate && !isTestMode) {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
}

function updateCountdown() {
    const now = new Date();
    const distance = targetDate - now;
    
    const totalMonthMs = 30 * 24 * 60 * 60 * 1000;
    let percent = 100 - ((distance / totalMonthMs) * 100);
    percent = Math.max(0, Math.min(100, percent));
    if(isTestMode) percent = 100; // امتلاء البطارية فوراً في وضع الاختبار
    
    document.getElementById('battery-fill').style.width = percent + '%';
    document.getElementById('battery-text').innerText = Math.floor(percent) + '%';

    if (distance > 0 && !isTestMode) {
        document.getElementById('cd-days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById('cd-hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById('cd-mins').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById('cd-secs').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
    } else {
        document.getElementById('cd-days').innerText = "00";
        document.getElementById('cd-hours').innerText = "00";
        document.getElementById('cd-mins').innerText = "00";
        document.getElementById('cd-secs').innerText = "00";
    }
}
setInterval(updateCountdown, 1000);
updateCountdown();


/** 
 * ========================================================
 * 2. البصمة التفاعلية (إصلاح جذري لمشكلة اللمس)
 * ========================================================
 */
const fpWrapper = document.getElementById('fp-wrapper');
const fpStatus = document.getElementById('fp-status');
let holdTimer;
let isHolding = false;

// 1. إيقاف القائمة المنسدلة المزعجة في الجوال عند الضغط المطول
fpWrapper.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// دالة بدء الضغط
function startHold(e) {
    if (e && e.cancelable) e.preventDefault(); // منع المتصفح من إيقاف اللمس
    
    if (isHolding) return;
    isHolding = true;
    
    fpWrapper.classList.add('scanning');
    fpStatus.classList.add('active');
    fpStatus.innerText = "جاري التحقق من هوية توتا... 🔍";
    
    // ضبط الوقت لثانيتين فقط ليكون سريعاً ومريحاً
    holdTimer = setTimeout(() => {
        verifyFingerprint();
    }, 2000);
}

// دالة إيقاف الضغط (إذا رفعت إصبعها قبل الثانيتين)
function stopHold(e) {
    if (!isHolding) return;
    isHolding = false;
    
    clearTimeout(holdTimer);
    fpWrapper.classList.remove('scanning');
    fpStatus.classList.remove('active');
    fpStatus.innerText = "اضغطي مطولاً للبصمة 👆";
}

// ربط أحداث اللمس للجوالات (passive: false مهم جداً لمنع الشاشة من الاهتزاز)
fpWrapper.addEventListener('touchstart', startHold, { passive: false });
window.addEventListener('touchend', stopHold, { passive: false });
window.addEventListener('touchcancel', stopHold, { passive: false }); 

// ربط أحداث الماوس لأجهزة الكمبيوتر
fpWrapper.addEventListener('mousedown', startHold);
window.addEventListener('mouseup', stopHold);
fpWrapper.addEventListener('mouseleave', stopHold);

// دالة التحقق وإظهار النوافذ
function verifyFingerprint() {
    stopHold(); // إيقاف الأنيميشن
    
    const now = new Date();
    // التحقق: هل وصلنا ليوم 29/10 أو وضع الاختبار مفعل؟
    const isReady = now >= targetDate || (now.getDate() === 29 && now.getMonth() === 9) || isTestMode;

    if (!isReady) {
        // رسالة التنبيه قبل الموعد
        Swal.fire({
            title: 'اكتمل التحقق! 🐾',
            html: 'أهلاً توتي! تم التحقق من البصمة بنجاح.. ولكن مفتاح المفاجأة والأغنية السرية لن ينشطا إلا يوم <strong>29/10</strong> في وجودي انا <strong>ليوث</strong>! خليكي مستعدة.',
            icon: 'info',
            confirmButtonText: 'حاضر',
            customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'btn' }
        });
    } else {
        // إدخال كلمة المرور
        Swal.fire({
            title: 'مرحباً توتا! ✨',
            text: 'البصمة متطابقة، أدخلي كلمة المرور لفتح المفاجأة:',
            input: 'text',
            inputPlaceholder: 'كلمة المرور...',
            confirmButtonText: 'فتح القفل',
            customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'btn' }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                // تنظيف الكلمة من الهمزات لضمان قبول "إيكادولي" بكل أشكالها
                const password = result.value.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
                
                if (password.includes('ايكادولي')) {
                    unlockMainSite();
                } else {
                    Swal.fire({ 
                        title: 'أوبس!', 
                        text: 'كلمة المرور غير صحيحة يا توتا!', 
                        icon: 'error', 
                        confirmButtonText: 'جرب مرة أخرى', 
                        customClass: { popup: 'dark-swal', confirmButton: 'btn' } 
                    });
                }
            }
        });
    }
}


/** 
 * ========================================================
 * 3. فتح الموقع والموسيقى (Dandelions Tuta Edition)
 * ========================================================
 */
const bgMusic = document.getElementById('bg-music');
let isPlaying = false;

function unlockMainSite() {
    // إخفاء صفحة القفل بنعومة
    document.getElementById('lock-screen').style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-site').style.display = 'block';
        fireBeautifulConfetti(); // إطلاق الألعاب النارية
        
        // تشغيل الموسيقى
        bgMusic.currentTime = 0; 
        bgMusic.volume = 0.5; // مستوى الصوت النصف
        bgMusic.play().catch(() => console.log("المتصفح يمنع التشغيل التلقائي"));
        
        document.getElementById('music-btn').classList.add('playing');
        document.getElementById('music-btn').innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
        
        // إظهار الموقع ببطء
        setTimeout(() => document.getElementById('main-site').classList.add('fade-in'), 100);
    }, 800);
}

// زر تشغيل وإيقاف الموسيقى
function toggleMusic() {
    const musicBtn = document.getElementById('music-btn');
    if (isPlaying) { 
        bgMusic.pause(); 
        musicBtn.classList.remove('playing'); 
        musicBtn.innerHTML = '<i class="fas fa-music"></i>'; 
    } else { 
        bgMusic.play(); 
        musicBtn.classList.add('playing'); 
        musicBtn.innerHTML = '<i class="fas fa-pause"></i>'; 
    }
    isPlaying = !isPlaying;
}

// التحكم الانسيابي بالصوت (Fade)
function fadeMusic(targetVolume) {
    if(!isPlaying) return;
    let step = bgMusic.volume > targetVolume ? -0.05 : 0.05;
    let fadeAudio = setInterval(function () {
        if(Math.abs(bgMusic.volume - targetVolume) > 0.05) {
            bgMusic.volume += step;
        } else {
            bgMusic.volume = targetVolume;
            clearInterval(fadeAudio);
        }
    }, 200);
}

// قفزة الأغنية عند فتح الرسالة الخاصة
function jumpToMusicDrop() {
    fadeMusic(0); // خفض الصوت
    setTimeout(() => {
        bgMusic.currentTime = 50; // قفزة لـ 00:50
        bgMusic.play();
        fadeMusic(1.0); // رفع الصوت لأعلى درجة
    }, 800);
}

// الانتقال بين الأقسام
function scrollToSection(id) { 
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); 
}


/** 
 * ========================================================
 * 4. لعبة الأقداح (نظام متكامل ومحمي)
 * ========================================================
 */
const gameSettings = { easy: { swaps: 5, speed: 600 }, medium: { swaps: 9, speed: 400 }, hard: { swaps: 15, speed: 250 } };
let currentDiff = 'easy'; 
let isGameRunning = false; 
let giftPosition = 1; 
let cupElements = []; 
let giftEl;

function setDifficulty(level) {
    if(isGameRunning) return; 
    currentDiff = level;
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active')); 
    event.target.classList.add('active');
}

function setupCups() {
    const wrapper = document.getElementById('cups-wrapper');
    wrapper.innerHTML = '';
    
    giftEl = document.createElement('div'); 
    giftEl.className = 'gift'; 
    giftEl.id = 'gift'; 
    giftEl.innerHTML = '<i class="fas fa-gift"></i>'; 
    wrapper.appendChild(giftEl);
    
    cupElements = [];
    const positions = ['0px', '120px', '240px'];

    for(let i=0; i<3; i++) {
        const cupCont = document.createElement('div'); 
        cupCont.className = 'cup-container'; 
        cupCont.style.right = positions[i]; 
        cupCont.dataset.pos = i;
        
        cupCont.addEventListener('click', () => { 
            if(!isGameRunning && cupCont.dataset.clickable === "true") guessCup(cupCont); 
        });
        
        const cup = document.createElement('div'); 
        cup.className = 'cup'; 
        cupCont.appendChild(cup); 
        wrapper.appendChild(cupCont); 
        cupElements.push(cupCont);
    }
    giftPosition = 1; 
    giftEl.style.right = positions[giftPosition];
}

async function startGame() {
    if(isGameRunning) return; 
    isGameRunning = true;
    
    const status = document.getElementById('game-status'); 
    const startBtn = document.getElementById('start-game-btn');
    startBtn.disabled = true; 
    status.innerText = "انتبهي جيداً يا توتا... 👀";
    
    setupCups(); 
    cupElements.forEach(c => c.dataset.clickable = "false");
    
    // رفع الأكواب لترى الهدية
    cupElements.forEach(c => c.querySelector('.cup').classList.add('lift')); 
    await sleep(1500);
    cupElements.forEach(c => c.querySelector('.cup').classList.remove('lift')); 
    await sleep(800);
    
    status.innerText = "جاري الخلط 🌪️";
    let swaps = gameSettings[currentDiff].swaps; 
    let speed = gameSettings[currentDiff].speed;
    
    for (let i = 0; i < swaps; i++) await shuffleCups(speed);
    
    status.innerText = "أين الهدية يا توتا؟ اختاري قدحاً! 🐾";
    cupElements.forEach(c => c.dataset.clickable = "true");
    isGameRunning = false; 
    startBtn.disabled = false; 
    startBtn.innerText = "إعادة اللعب";
}

function shuffleCups(speed) {
    return new Promise(resolve => {
        let idx1 = Math.floor(Math.random() * 3); 
        let idx2 = Math.floor(Math.random() * 3);
        while(idx1 === idx2) idx2 = Math.floor(Math.random() * 3);
        
        let cup1 = cupElements[idx1]; 
        let cup2 = cupElements[idx2];
        let pos1 = cup1.style.right; 
        let pos2 = cup2.style.right;
        
        if (cup1.dataset.pos == giftPosition) giftPosition = cup2.dataset.pos;
        else if (cup2.dataset.pos == giftPosition) giftPosition = cup1.dataset.pos;
        
        let tempPos = cup1.dataset.pos; 
        cup1.dataset.pos = cup2.dataset.pos; 
        cup2.dataset.pos = tempPos;
        
        cup1.style.transition = `right ${speed}ms ease-in-out`; 
        cup2.style.transition = `right ${speed}ms ease-in-out`;
        cup1.style.right = pos2; 
        cup2.style.right = pos1;
        
        giftEl.style.transition = 'none'; 
        giftEl.style.right = ['0px', '120px', '240px'][giftPosition];
        setTimeout(resolve, speed + 50);
    });
}

function guessCup(cupContainer) {
    const status = document.getElementById('game-status');
    const chosenPos = parseInt(cupContainer.dataset.pos);
    cupElements.forEach(c => c.dataset.clickable = "false"); // منع الضغط المتكرر
    
    cupContainer.querySelector('.cup').classList.add('lift');
    
    if(chosenPos === giftPosition) { 
        status.innerText = "برافو توتا! إجابة صحيحة 🎉✨😻"; 
        fireBeautifulConfetti(); 
    } else { 
        status.innerText = "أوبس! حظ أوفر المرة القادمة يا توتا 🙈🐾"; 
        cupElements.find(c => parseInt(c.dataset.pos) === giftPosition).querySelector('.cup').classList.add('lift'); 
    }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
setupCups();

/** 
 * ========================================================
 * 5. بطاقات الأمنيات وإطفاء الشمعة
 * ========================================================
 */
function flipCard(card) { card.classList.toggle('flipped'); }

function blowCandle() {
    const flame = document.getElementById('flame');
    const msg = document.getElementById('cake-msg');
    
    if (!flame.classList.contains('hidden')) {
        flame.classList.add('hidden');
        msg.innerHTML = "✨ تم إطفاء الشمعة! أمنية سعيدة وكل عام وأنتِ بخير يا أجمل توتا 🎉😻";
        fireBeautifulConfetti();
    }
}

/** 
 * ========================================================
 * 6. محرك الاحتفال (Canvas Confetti)
 * ========================================================
 */
function fireBeautifulConfetti() {
    var duration = 3 * 1000; 
    var animationEnd = Date.now() + duration; 
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: ['#ff6b8b', '#ffd700', '#2196f3', '#ffffff'] };
    
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
    
    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        
        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}