
const bgMusic = document.getElementById('bgMusic');
let isMusicPlaying = false;
let currentStage = 1;

// تشغيل الموسيقى والبدء فور الضغط على القلب
function startJourney() {
    bgMusic.play();
    isMusicPlaying = true;
    document.querySelector('#music-btn i').className = 'fas fa-pause';
    goToStage(2);
}

function toggleMusic() {
    const icon = document.querySelector('#music-btn i');
    if (isMusicPlaying) {
        bgMusic.pause();
        icon.className = 'fas fa-music';
    } else {
        bgMusic.play();
        icon.className = 'fas fa-pause';
    }
    isMusicPlaying = !isMusicPlaying;
}

function goToStage(stageNum) {
    document.querySelectorAll('.stage').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dot').forEach((el, index) => {
        el.classList.toggle('active', index + 1 === stageNum);
    });
    document.getElementById(`stage-${stageNum}`).classList.add('active');
    currentStage = stageNum;

    if (stageNum === 2 && !gameStarted) initMemoryGame();
    if (stageNum === 5 && !letterTyped) startTypewriter();
}

// اللعبة السحرية
const emojis = ['😹', '😻', '🙀', '😽', '😼', '😿'];
let gameCards = [...emojis, ...emojis];
let firstCard = null, secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let gameTimer;
let timeLeft = 20;
let gameStarted = false;

function initMemoryGame() {
    gameStarted = true; matchedPairs = 0; timeLeft = 20;
    document.getElementById('game-timer').innerText = timeLeft;
    document.getElementById('next-to-3').classList.add('hidden');
    
    const board = document.getElementById('memory-board');
    board.innerHTML = '';
    gameCards.sort(() => 0.5 - Math.random());
    
    gameCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('mem-card', 'hidden-card');
        card.dataset.emoji = emoji;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

    this.classList.remove('hidden-card');
    this.innerText = this.dataset.emoji;

    if (!firstCard) {
        firstCard = this;
        if (!gameTimer) startTimer();
        return;
    }

    secondCard = this;
    checkMatch();
}

function checkMatch() {
    lockBoard = true;
    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        firstCard.classList.add('matched'); secondCard.classList.add('matched');
        resetBoard(); matchedPairs++;
        if (matchedPairs === 6) winGame();
    } else {
        setTimeout(() => {
            firstCard.classList.add('hidden-card'); firstCard.innerText = '';
            secondCard.classList.add('hidden-card'); secondCard.innerText = '';
            resetBoard();
        }, 800);
    }
}

function resetBoard() { [firstCard, secondCard] = [null, null]; lockBoard = false; }

function startTimer() {
    gameTimer = setInterval(() => {
        timeLeft--; document.getElementById('game-timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(gameTimer); gameTimer = null; lockBoard = true;
            Swal.fire({
                title: 'انتهى الوقت! 🙀', text: 'القطط كانت سريعة جداً، جربي مرة ثانية!', icon: 'warning',
                confirmButtonText: 'إعادة المحاولة', customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'swal-btn' }
            }).then(() => { initMemoryGame(); lockBoard = false; });
        }
    }, 1000);
}

function winGame() {
    clearInterval(gameTimer);
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    document.getElementById('next-to-3').classList.remove('hidden');
}

// بطاقات الذكريات
const wisdomData = [
    { icon: 'fa-cat', title: 'احلى الصدف', text: 'بحب الصدفه الي عرفتني فيكي و في اللطف واحلى توته في الدينا 🥰' },
    { icon: 'fa-laugh-beam', title: 'فرفوشتنا', text: 'بحب فرفشتك وجنانك وتفكيرك الايجابي اللطيف و اسلوبك المميز 😭😂.' },
    { icon: 'fa-star', title: 'فخرنا وفرحه اهلك ', text: 'ان شاء الله تتوفقي في حياتك توتي وترفعي راس اهلك فيكي و ويفرحو بيكي يارب😘.' },
    { icon: 'fa-hand-holding-heart', title: 'حنّيتك و طيبتك', text: 'بشكرك هل طيبتك ما اجمل طيبتك وقلبك الابيض ربي يحفضك ويسعدك 🤍.' },
    { icon: 'fa-gem', title: 'توتتي الغاليه المميزه ', text: 'إنتِ مش بس صديقه، إنتِ اخت وسند حقيقي لا يُعوض.' },
    { icon: 'fa-envelope', title: 'رسالة', text: 'توتيييييييييييييي بحبك كثيييييييييير وبتمنى اكون ليكي صديق واخ طيب مثل ما تتمنى واسعدك يارب❤️' }
];

const wisdomContainer = document.getElementById('wisdom-cards');
wisdomData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'wisdom-card';
    card.innerHTML = `<i class="fas ${item.icon}"></i><h3>${item.title}</h3>`;
    card.onclick = () => Swal.fire({
        title: item.title, text: item.text, confirmButtonText: '💖',
        customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'swal-btn' }
    });
    wisdomContainer.appendChild(card);
});

// الشموع
const candlesContainer = document.getElementById('candles-container');
let blownCandles = 0;
for (let i = 0; i < 5; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle-emoji'; candle.innerText = '🕯️';
    candle.onclick = function() {
        if (!this.classList.contains('off')) {
            this.classList.add('off'); this.innerText = '💨'; blownCandles++;
            if (blownCandles === 5) {
                document.getElementById('wish-section').classList.remove('hidden');
                confetti({ particleCount: 150 });
            }
        }
    };
    candlesContainer.appendChild(candle);
}

// إرسال الأمنية للإيميل بصمت
async function sendWish() {
    const wish = document.getElementById('wish-input').value.trim();
    if (!wish) {
        Swal.fire({ title: 'لحظة!', text: 'لازم تكتبي أمنيتك الأول 😾', icon: 'warning', customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'swal-btn' }});
        return;
    }

    // إظهار رسالة تحميل لتوتا
    Swal.fire({
        title: 'جاري إرسال الأمنية بلمسة سحرية... ✨',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'dark-swal', title: 'dark-swal-title' }
    });

    try {
        // الإرسال في الخلفية عبر API
        await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: '270e8e8c-2e81-4a51-aa3f-79ea06a160a3', // استبدل هذه القيمة!
                subject: '✨ أمنية عيد ميلاد توتا السحرية 🎂',
                message: `الأمنية التي كتبتها توتا هي:\n\n"${wish}"`
            })
        });

        // نجاح الإرسال
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.8 } });
        Swal.fire({
            title: 'وصلت الأمنية! 🎉', text: 'طارت أمنيتك السحرية لليوث ووصلت بأمان!', icon: 'success',
            confirmButtonText: 'إكمال الرحلة 🚀',
            customClass: { popup: 'dark-swal', title: 'dark-swal-title', confirmButton: 'swal-btn' }
        }).then(() => goToStage(5));

    } catch (error) {
        Swal.fire({ title: 'عذراً!', text: 'حدث خطأ في الإرسال، ولكن حاولي من جديد', icon: 'error', confirmButtonText: 'إكمال الرحلة', customClass: { popup: 'dark-swal', confirmButton: 'swal-btn' }}).then(() => goToStage(5));
    }
}

// آلة الكتابة
const finalLetter = `يا أحلى وأغلى توتا في الدنيا كلها.. 💖✨

عارفة؟ وجودك في حياتي مش مجرد وجود عادي، أنتِ النعمة العظيمة اللي ربنا كرمني بيها. أنتِ الأخت اللي ما جابتهاش أمي، الصديقة اللي بلاقي معاها راحتي وأماني، وضحكتك هي اللي بتهوّن أي يوم صعب.

في عيد ميلادك السنة دي، ما حبتش أهديكي مجرد كلام أو هدية عادية.. حبيت أعملك عالم كامل شبه قلبك اللطيف، مليان سحر، وحياة، وقطط عسولة شبهك! 🐾🌸

أنتِ مش بس بنوتة فرفوشة ودمها خفيف، أنتِ الروح اللي بتنور المكان أول ما تدخليه، والابتسامة اللي بترسميها على وش كل اللي حواليكي بدون استئذان. 

مهما عدت الأيام وكبرنا، هتفضلي دايماً "أميرة أكتوبر" المدللة، البنوتة اللي قلبها أبيض من الغيم، وأطيب خلق الله. أتمنى من كل قلبي تكون سنتك الجديدة دي مليانة نجاحات، وضحكات من جوة القلب، وأيام حلوة شبه جمال عينيكي.

دمتِ لي أخت وسند ونور مبيطفيش أبداً..
كل سنة وأنتِ بطلة قصتي، وكل عام وأنتِ بـ ألف خير يا توتا يا سكر! 🎂✨💖`;

let typeIndex = 0; let letterTyped = false;
function startTypewriter() {
    letterTyped = true;
    const txtElement = document.getElementById('typewriter-text');
    txtElement.innerHTML = '';
    function type() {
        if (typeIndex < finalLetter.length) {
            txtElement.innerHTML += finalLetter.charAt(typeIndex) === '\n' ? '<br><br>' : finalLetter.charAt(typeIndex);
            typeIndex++; setTimeout(type, 50);
        }
    }
    type();
}