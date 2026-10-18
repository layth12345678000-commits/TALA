// ==========================================
// 1. إعدادات العداد ووضع الاختبار (?test=true)
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('test') === 'true'; 

const targetDate = new Date();
targetDate.setMonth(9); // شهر أكتوبر (نظام البرمجة يبدأ من 0)
targetDate.setDate(29);
targetDate.setHours(0, 0, 0, 0);

if (new Date() > targetDate && !isTestMode) {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
}

function updateCountdown() {
    const now = new Date();
    const distance = targetDate - now;
    
    const totalMonthMs = 30 * 24 * 60 * 60 * 1000;
    let percent = 100 - ((distance / totalMonthMs) * 100);
    percent = Math.max(0, Math.min(100, percent));
    if(isTestMode) percent = 100;
    
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

// ==========================================
// 2. برمجة البصمة بنظام PointerCapture (مستقر 100%)
// ==========================================
const fpWrapper = document.getElementById('fp-wrapper');
const fpStatus = document.getElementById('fp-status');
let holdTimer = null;
let isHolding = false;

// إيقاف القائمة المنسدلة في الجوال
fpWrapper.oncontextmenu = function(e) { e.preventDefault(); return false; };

function startHold(e) {
    if (e.pointerId !== undefined) { try { fpWrapper.setPointerCapture(e.pointerId); } catch(err) {} }
    
    if (isHolding) return;
    isHolding = true;
    
    fpWrapper.classList.add('scanning');
    fpStatus.classList.add('active');
    fpStatus.innerText = "جاري التحقق من هوية توتا... 🔍";
    
    holdTimer = setTimeout(() => {
        verifyFingerprint();
    }, 2000);
}

function stopHold(e) {
    if (!isHolding) return;
    isHolding = false;
    
    if (e && e.pointerId !== undefined) { try { fpWrapper.releasePointerCapture(e.pointerId); } catch(err) {} }
    
    clearTimeout(holdTimer);
    fpWrapper.classList.remove('scanning');
    fpStatus.classList.remove('active');
    fpStatus.innerText = "اضغطي مطولاً للبصمة 👆";
}

fpWrapper.addEventListener('pointerdown', startHold);
fpWrapper.addEventListener('pointerup', stopHold);
fpWrapper.addEventListener('pointercancel', stopHold);

// ==========================================
// 3. التحقق وإدخال كلمة المرور
// ==========================================
function verifyFingerprint() {
    stopHold(new PointerEvent('pointerup')); // إيقاف الأنيميشن يدوياً
    
    const now = new Date();
    const isReady = now >= targetDate || (now.getDate() === 29 && now.getMonth() === 9) || isTestMode;

    if (!isReady) {
        Swal.fire({
            title: 'اكتمل التحقق! 🐾',
            html: 'أهلاً توتي! تم التحقق من البصمة بنجاح.. ولكن مفتاح المفاجأة والأغنية السرية لن ينشطا إلا يوم <strong>29/10</strong> في وجودي انا <strong>ليوث</strong>! خليكي مستعدة.',
            icon: 'info',
            confirmButtonText: 'حاضر',
            customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'swal-btn' }
        });
    } else {
        Swal.fire({
            title: 'مرحباً توتا! ✨',
            text: 'البصمة متطابقة، أدخلي كلمة المرور لفتح المفاجأة:',
            input: 'text',
            inputPlaceholder: 'كلمة المرور...',
            confirmButtonText: 'فتح القفل',
            allowOutsideClick: false,
            customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'swal-btn' }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const password = result.value.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').trim().toLowerCase();
                if (password.includes('ايكادولي')) {
                    // نجاح! الانتقال للصفحة الثانية
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    document.body.style.opacity = '0'; // اختفاء ناعم للشاشة
                    setTimeout(() => { 
                        window.location.href = "surprise.html"; // الانتقال الفعلي
                    }, 1000);
                } else {
                    Swal.fire({ 
                        title: 'أوبس!', text: 'كلمة المرور غير صحيحة يا توتا!', icon: 'error', 
                        confirmButtonText: 'جرب مرة أخرى', 
                        customClass: { popup: 'dark-swal', confirmButton: 'swal-btn' } 
                    });
                }
            }
        });
    }
}
