// Отключаем автоматическое восстановление позиции скролла браузером при обновлении
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
    // Принудительно скроллим на самый верх при загрузке страницы
    window.scrollTo(0, 0);

    // ==================================================================== //
    // 1. Анимации при скролле (Наблюдатель Intersection Observer)
    // ==================================================================== //
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.4 // Чуть уменьшил порог для телефонов, чтобы срабатывало надежнее
    };

    const heartWrapper = document.getElementById('unfolding-heart');
    const hugScene = document.getElementById('hug-scene');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'unfolding-heart') {
                    entry.target.classList.add('open');
                }
                if (entry.target.id === 'hug-scene') {
                    entry.target.classList.add('hugging');
                }
            } else {
                if (entry.target.id === 'unfolding-heart') {
                    entry.target.classList.remove('open');
                }
                if (entry.target.id === 'hug-scene') {
                    entry.target.classList.remove('hugging');
                }
            }
        });
    }, observerOptions);

    if (heartWrapper) observer.observe(heartWrapper);
    if (hugScene) observer.observe(hugScene);


    // ==================================================================== //
    // 2. Интерактивные карточки-причины (Клик для переворота)
    // ==================================================================== //
    const cards = document.querySelectorAll('.reason-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // ==================================================================== //
    // 2.5. ИНТЕРАКТИВНЫЙ КОНВЕРТ (Открытие по клику)
    // ==================================================================== //
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    if (envelopeWrapper) {
        envelopeWrapper.addEventListener('click', () => {
            // Переключает класс .is-open, который запускает CSS-анимацию выезда письма
            envelopeWrapper.classList.toggle('is-open');
        });
    }

    // ==================================================================== //
    // 3. Фон из летающих сердечек (Canvas)
    // ==================================================================== //
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });

        class HeartParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 8 + 8; // Сделал сердечки чуть меньше для аккуратности
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = Math.random() > 0.5 ? 'rgba(255, 107, 139, 0.4)' : 'rgba(255, 182, 193, 0.6)';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                let topCurveHeight = this.size * 0.3;
                ctx.moveTo(this.x, this.y + topCurveHeight);
                ctx.bezierCurveTo(this.x, this.y, this.x - this.size / 2, this.y, this.x - this.size / 2, this.y + topCurveHeight);
                ctx.bezierCurveTo(this.x - this.size / 2, this.y + this.size / 2, this.x, this.y + this.size * 0.8, this.x, this.y + this.size);
                ctx.bezierCurveTo(this.x, this.y + this.size * 0.8, this.x + this.size / 2, this.y + this.size / 2, this.x + this.size / 2, this.y + topCurveHeight);
                ctx.bezierCurveTo(this.x + this.size / 2, this.y, this.x, this.y, this.x, this.y + topCurveHeight);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            // Сокращаем плотность на мобилках для лучшей производительности
            const densityBase = window.innerWidth < 768 ? 25000 : 20000;
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / densityBase);
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new HeartParticle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

    // ==================================================================== //
    // 4. Тумблер Темной / Светлой Темы
    // ==================================================================== //
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const sunSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    const moonSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        if (body.classList.contains('light-theme')) {
            themeBtn.innerHTML = moonSVG;
        } else {
            themeBtn.innerHTML = sunSVG;
        }
    });

    // ==================================================================== //
    // 5. ИНТЕРАКТИВНАЯ РОМАШКА С КУЛАКОМ
    // ==================================================================== //
    const daisyContainer = document.getElementById('daisy-container');
    const daisyResult = document.getElementById('daisy-result');
    const fistAnimation = document.getElementById('fist-animation');

    // Подготовим SVG иконки для текста
    const heartSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--acc-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1em; height: 1em; vertical-align: middle;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    const smileSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1em; height: 1em; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
    const sadSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1em; height: 1em; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;

    if (daisyContainer) {
        const petalCount = 14;
        const angleStep = 360 / petalCount;
        let petalsLeft = petalCount;
        let isFistAnimating = false;

        let nextLoves = Math.random() > 0.5;

        for (let i = 0; i < petalCount; i++) {
            const p = document.createElement('div');
            p.classList.add('petal');
            p.style.transform = `rotate(${i * angleStep}deg)`;
            daisyContainer.appendChild(p);

            p.addEventListener('click', () => {
                if (isFistAnimating || p.classList.contains('fallen')) return;

                p.style.transform = `rotate(${i * angleStep}deg) translateY(-140px) scale(0.6) rotate(60deg)`;
                p.style.opacity = '0';
                p.classList.add('fallen');
                petalsLeft--;

                let loves = nextLoves;
                nextLoves = !nextLoves;

                if (loves) {
                    daisyResult.innerHTML = `<span>Любит! ${smileSVG}</span>`;

                    if (petalsLeft === 0) {
                        setTimeout(() => {
                            daisyResult.innerHTML = `<span>Моя любовь безусловна! ${heartSVG}</span>`;
                        }, 2500);
                    }
                } else {
                    if (petalsLeft === 0) {
                        isFistAnimating = true;
                        daisyResult.innerHTML = `<span class="not-word">Не&nbsp;</span><span class="loves-text">любит ${sadSVG}</span>`;

                        setTimeout(() => {
                            fistAnimation.classList.add('fist-punch');

                            setTimeout(() => {
                                const notWord = document.querySelector('.not-word');
                                if (notWord) notWord.classList.add('shattered');

                                const lovesText = document.querySelector('.loves-text');
                                if (lovesText) lovesText.innerHTML = `любит! ${smileSVG} <br><span style="font-size:1.2rem; opacity:0.8; display:block;">(а вариантов нет!)</span>`;

                                setTimeout(() => {
                                    fistAnimation.classList.remove('fist-punch');
                                    isFistAnimating = false;

                                    setTimeout(() => {
                                        daisyResult.innerHTML = `<span>Моя любовь безусловна! ${heartSVG}</span>`;
                                    }, 2500);
                                }, 800);

                            }, 250);
                        }, 500);
                    } else {
                        daisyResult.innerHTML = `<span>Не любит ${sadSVG}</span>`;
                    }
                }
            });
        }
    }

    // ==================================================================== //
    // 6. ИНТЕРАКТИВНАЯ МИНИ-ИГРА (КЛИКЕР-СЕРДЕЧКО)
    // ==================================================================== //
    const pinata = document.getElementById('love-pinata');
    const pinataCounter = document.getElementById('pinata-counter');
    const pinataResult = document.getElementById('pinata-result');
    const pinataContainer = document.getElementById('pinata-container');

    let clicks = 0;
    const maxClicks = 20;
    let hasExploded = false;

    if (pinata) {
        const starSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1em; height: 1em; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

        pinata.addEventListener('click', (e) => {
            if (hasExploded) return;

            clicks++;

            pinata.classList.add('pop');
            setTimeout(() => pinata.classList.remove('pop'), 50);

            let scale = 1 + (clicks * 0.05);
            let percent = Math.floor((clicks / maxClicks) * 100);

            pinataCounter.textContent = percent + '%';
            pinata.style.transform = `scale(${scale})`;

            if (clicks >= maxClicks) {
                hasExploded = true;
                pinataCounter.textContent = '∞%';
                pinataResult.innerHTML = `Моя любовь к тебе бесконечна! ${starSVG} ${heartSVG}`;
                // Меняем центральное сердце на закрашенное
                pinata.innerHTML = `<svg viewBox="0 0 24 24" fill="var(--acc-color)" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 120px; height: 120px; filter: drop-shadow(0 0 25px rgba(255, 107, 139, 0.8));"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

                for (let i = 0; i < 30; i++) {
                    createMiniHeart();
                }

                pinata.style.transform = 'scale(1.2)';
            }
        });

        function createMiniHeart() {
            const heart = document.createElement('div');
            heart.classList.add('mini-heart');
            // Вставляем случайное SVG
            const icons = [heartSVG, smileSVG, starSVG];
            heart.innerHTML = icons[Math.floor(Math.random() * icons.length)];

            const angle = Math.random() * Math.PI * 2;
            const velocity = 100 + Math.random() * 200;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            const rot = Math.random() * 360;

            heart.style.setProperty('--tx', `${tx}px`);
            heart.style.setProperty('--ty', `${ty}px`);
            heart.style.setProperty('--rot', `${rot}deg`);

            heart.style.animation = `explodeHeart ${0.6 + Math.random() * 0.5}s ease-out forwards`;

            pinataContainer.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 1200);
        }
    }

    // Twemoji удален по просьбе пользователя (теперь используются SVG)

    // ==================================================================== //
    // 8. SPA НАВИГАЦИЯ (ПЕРЕКЛЮЧЕНИЕ МЕСЯЦЕВ)
    // ==================================================================== //
    const navLeft = document.getElementById('nav-left');
    const navRight = document.getElementById('nav-right');
    const month1View = document.getElementById('month1-view');
    const month2View = document.getElementById('month2-view');

    let currentMonth = 1;

    function switchMonth(toMonth) {
        if (currentMonth === toMonth) return;

        // Плавно скроллим страницу на самый верх
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Небольшая задержка, чтобы скролл успел начаться перед сменой контента
        setTimeout(() => {
            if (toMonth === 2) {
                // Прячем 1 месяц (уезжает влево)
                month1View.classList.remove('active');
                month1View.classList.add('exit-left');

                // Показываем 2 месяц (приезжает справа)
                month2View.classList.remove('exit-right');
                month2View.classList.add('active');

                // Переключаем кнопки
                navRight.style.display = 'none';
                navLeft.style.display = 'flex';
            } else {
                // Прячем 2 месяц (уезжает вправо)
                month2View.classList.remove('active');
                month2View.classList.add('exit-right');

                // Показываем 1 месяц (приезжает слева)
                month1View.classList.remove('exit-left');
                month1View.classList.add('active');

                // Переключаем кнопки
                navLeft.style.display = 'none';
                navRight.style.display = 'flex';
            }

            currentMonth = toMonth;
        }, 150); // Небольшая пауза для эффекта скролла
    }

    if (navRight) navRight.addEventListener('click', () => switchMonth(2));
    if (navLeft) navLeft.addEventListener('click', () => switchMonth(1));

    // ==================================================================== //
    // 9. МОДУЛЬ ТЕСТА (QUIZ)
    // ==================================================================== //
    const quizData = [
        {
            question: "Какой мой любимый цвет?",
            options: [
                "Арбузный сок",
                "Цвет твоих глаз",
                "Шлакоблочный",
                "Запах асфальта после дождя"
            ],
            correct: 1
        },
        {
            question: "Какая моя любимая игра?",
            options: [
                "Прятки с дедлайнами",
                "Dota 2",
                "Перекати-поле",
                "Кидать пельмени в вентилятор"
            ],
            correct: 1
        },
        {
            question: "Что я выберу на идеальном свидании?",
            options: [
                "Украсть трактор и уехать в закат",
                "Считать голубей",
                "Съесть ведро майонеза",
                "Построить шалаш из одеял с тобой"
            ],
            correct: 3
        },
        {
            question: "Что меня растраивает больше всего?",
            options: [
                "Когда ты грустишь",
                "Теплый унитаз",
                "Когда чайник слишком долго кипит",
                "Лысые кошки"
            ],
            correct: 0
        },
        {
            question: "Кто я для тебя?",
            options: [
                "Человек-паук",
                "Внеземной разум",
                "Твой котик",
                "Арбуз"
            ],
            correct: 2
        }
    ];

    const quizQuestionBox = document.getElementById('quiz-question-box');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizResult = document.getElementById('quiz-result');
    const quizNextBtn = document.getElementById('quiz-next-btn');
    const quizFinal = document.getElementById('quiz-final');

    let currentQuizIndex = 0;

    if (quizQuestionBox) {
        function loadQuestion() {
            const q = quizData[currentQuizIndex];
            quizQuestion.textContent = `${currentQuizIndex + 1}. ${q.question}`;
            quizOptions.innerHTML = '';
            quizResult.style.display = 'none';
            quizNextBtn.style.display = 'none';

            q.options.forEach((opt, index) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                btn.addEventListener('click', () => selectAnswer(btn, index, q.correct));
                quizOptions.appendChild(btn);
            });
        }

        function selectAnswer(btn, selectedIndex, correctIndex) {
            // Блокируем повторные нажатия, если кнопка "Дальше" уже появилась
            if (quizNextBtn.style.display === 'block') return;

            const optionsBtns = quizOptions.querySelectorAll('.quiz-option');

            if (selectedIndex === correctIndex) {
                btn.classList.add('correct');
                quizResult.innerHTML = `Угадала, моя умничка! ${smileSVG}`;
            } else {
                btn.classList.add('wrong');
                // Подсвечиваем правильный (или 그냥 оставляем так, как будто ее ответ и есть правильный)
                // optionsBtns[correctIndex].classList.add('correct');
                btn.classList.add('correct'); // Трюк: подсвечиваем ее ответ как правильный
                quizResult.innerHTML = `Не угадала, но любимая всегда права, так что ответ правильный! ${heartSVG}`;
            }

            quizResult.style.display = 'block';
            quizNextBtn.style.display = 'block';
        }

        quizNextBtn.addEventListener('click', () => {
            currentQuizIndex++;
            if (currentQuizIndex < quizData.length) {
                loadQuestion();
            } else {
                quizQuestionBox.style.display = 'none';
                quizFinal.style.display = 'block';
            }
        });

        // Запуск первого вопроса
        loadQuestion();
    }

    // ==================================================================== //
    // 10. МОДУЛЬ КОСМОС (ПЛАНЕТЫ И СУПЕРНОВА)
    // ==================================================================== //
    const spaceContainer = document.getElementById('space-container');
    const planetMe = document.getElementById('planet-me');
    const planetYou = document.getElementById('planet-you');
    const flashOverlay = document.getElementById('flash-overlay');
    const supernovaContainer = document.getElementById('supernova-container');

    if (spaceContainer && planetMe && planetYou) {
        let distance = 40;
        let hasCollided = false;

        planetMe.style.left = '10%';
        planetYou.style.right = '10%';

        spaceContainer.addEventListener('click', () => {
            if (hasCollided) return;

            distance -= 2;
            if (distance < 0) distance = 0;

            let currentPos = 10 + (40 - distance);

            planetMe.style.left = `${currentPos}%`;
            planetYou.style.right = `${currentPos}%`;

            if (distance === 0 && !hasCollided) {
                hasCollided = true;

                // 1. Включаем белую вспышку
                flashOverlay.classList.add('flash');

                // 2. Прячем планеты
                setTimeout(() => {
                    planetMe.style.display = 'none';
                    planetYou.style.display = 'none';

                    // Показываем супернову под белым экраном
                    supernovaContainer.classList.add('active');

                    const hint = spaceContainer.querySelector('.space-hint');
                    if (hint) hint.style.display = 'none';
                }, 1500);

                // 3. Убираем вспышку через 3 секунды
                setTimeout(() => {
                    flashOverlay.classList.remove('flash');
                }, 3000);
            }
        });
    }

    // ==================================================================== //
    // 11. СЛАЙДЕР КАРТОЧЕК ЛЮБВИ
    // ==================================================================== //
    const loveCards = document.querySelectorAll('.cards-wrapper .love-card');
    const prevCardBtn = document.getElementById('prev-card-btn');
    const nextCardBtn = document.getElementById('next-card-btn');
    let currentLoveCard = 0;

    if (loveCards.length > 0 && prevCardBtn && nextCardBtn) {
        function showLoveCard(index) {
            loveCards.forEach(card => card.classList.remove('active'));
            loveCards[index].classList.add('active');
        }

        prevCardBtn.addEventListener('click', () => {
            currentLoveCard--;
            if (currentLoveCard < 0) currentLoveCard = loveCards.length - 1;
            showLoveCard(currentLoveCard);
        });

        nextCardBtn.addEventListener('click', () => {
            currentLoveCard++;
            if (currentLoveCard >= loveCards.length) currentLoveCard = 0;
            showLoveCard(currentLoveCard);
        });
    }

    // ==================================================================== //
    // 12. МОДУЛЬ "ЕСЛИ ГРУСТНО"
    // ==================================================================== //
    const sadBtn = document.getElementById('sad-btn');
    const sadMessageContainer = document.getElementById('sad-message-container');

    if (sadBtn && sadMessageContainer) {
        const svgHeart = `<svg viewBox="0 0 24 24" fill="var(--acc-color)" stroke="none" style="width:1.2em; height:1.2em; vertical-align:middle; margin-left:5px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        const svgSun = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--acc-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; vertical-align:middle; margin-left:5px;"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
        const svgSmile = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; vertical-align:middle; margin-left:5px; color:var(--acc-color);"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
        const svgSparkle = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--acc-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; vertical-align:middle; margin-left:5px;"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>`;

        const sadMessages = [
            `Эй... ну ты чего? Улыбнись, пожалуйста! Ты самое дорогое, что у меня есть. ${svgHeart}`,
            `Даже когда небо затянуто тучами, помни: над ними всегда светит солнце. И ты — мое солнце! ${svgSun}`,
            `Я всегда рядом, даже если мы не держимся за руки прямо сейчас. Я крепко-крепко тебя обнимаю! ${svgSmile}`,
            `Грусть — это временно. А моя любовь к тебе — навсегда! ${svgSparkle}`,
            `Закрой глаза, сделай глубокий вдох... Представь, что я целую тебя в носик. Легче? ${svgHeart}`,
            `Всё будет хорошо, котя. Мы со всем справимся вместе. Я в тебя верю! ${svgSparkle}`,
            `Если бы я мог, я бы забрал всю твою грусть себе, чтобы ты только радовалась! ${svgSmile}`
        ];

        let lastIndex = -1;

        sadBtn.addEventListener('click', () => {
            sadBtn.style.transform = 'scale(0.9)';
            setTimeout(() => sadBtn.style.transform = '', 150);

            let existingCard = sadMessageContainer.querySelector('.sad-message-card');
            if (existingCard) {
                existingCard.classList.remove('show');
                existingCard.style.transform = 'rotateX(-40deg) translateY(-30px) scale(0.8)';
                setTimeout(() => {
                    sadMessageContainer.innerHTML = '';
                    createNewMessage();
                }, 400);
            } else {
                createNewMessage();
            }

            function createNewMessage() {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * sadMessages.length);
                } while (randomIndex === lastIndex);
                lastIndex = randomIndex;

                const card = document.createElement('div');
                card.className = 'sad-message-card glass-panel';
                card.innerHTML = sadMessages[randomIndex];

                sadMessageContainer.appendChild(card);

                // Триггерим анимацию
                setTimeout(() => {
                    card.classList.add('show');
                }, 50);
            }
        });
    }

    // ==================================================================== //
    // 13. МОДУЛЬ "ХОЧУ ИЗВИНИТЬСЯ"
    // ==================================================================== //
    const sorryBtn = document.getElementById('sorry-btn');
    const sorryMessageContainer = document.getElementById('sorry-message-container');

    if (sorryBtn && sorryMessageContainer) {
        const svgSadFace = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em; height:1.2em; vertical-align:middle; margin-left:5px; color:var(--acc-color);"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;

        const sorryMessages = [
            `...за то, что доводил тебя до слез. Прости меня, пожалуйста ${svgSadFace}`,
            `...за то, что заставлял тебя грустить. Я не хотел ${svgSadFace}`,
            `...за то, что все тебе порчу. Ты заслуживаешь лучшего ${svgSadFace}`,
        ];

        let lastSorryIndex = -1;

        sorryBtn.addEventListener('click', () => {
            sorryBtn.style.transform = 'scale(0.9)';
            setTimeout(() => sorryBtn.style.transform = '', 150);

            let existingCard = sorryMessageContainer.querySelector('.sad-message-card');
            if (existingCard) {
                existingCard.classList.remove('show');
                existingCard.style.transform = 'rotateX(-40deg) translateY(-30px) scale(0.8)';
                setTimeout(() => {
                    sorryMessageContainer.innerHTML = '';
                    createSorryMessage();
                }, 400);
            } else {
                createSorryMessage();
            }

            function createSorryMessage() {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * sorryMessages.length);
                } while (randomIndex === lastSorryIndex);
                lastSorryIndex = randomIndex;

                const card = document.createElement('div');
                card.className = 'sad-message-card glass-panel';
                card.innerHTML = sorryMessages[randomIndex];

                sorryMessageContainer.appendChild(card);

                setTimeout(() => {
                    card.classList.add('show');
                }, 50);
            }
        });
    }

    // ==================================================================== //
    // 14. ТАЙМЕР ОТНОШЕНИЙ
    // ==================================================================== //
    // ⬇️ ДАТА НАЧАЛА ОТНОШЕНИЙ — меняй здесь
    // Формат: 'ГГГГ-ММ-ДД' (год-месяц-день)
    // Например: '2026-03-24' = 24 марта 2026
    function updateLoveTimer() {
        const startDate = new Date('2026-03-14T00:00:00');
        const now = new Date();
        const diff = now - startDate;

        if (diff < 0) return; // на случай если дата ещё не наступила

        const totalSeconds = Math.floor(diff / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        const pad = (n) => String(n).padStart(2, '0');

        const dEl = document.getElementById('timer-days');
        const hEl = document.getElementById('timer-hours');
        const mEl = document.getElementById('timer-minutes');
        const sEl = document.getElementById('timer-seconds');

        if (dEl) dEl.textContent = days;
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
    }

    updateLoveTimer();
    setInterval(updateLoveTimer, 1000);

    // ==================================================================== //
    // 15. ИНТЕРАКТИВНЫЙ СВИТОК (ПИСЬМО С ПЕЧАТЬЮ)
    // ==================================================================== //
    const scrollSeal = document.getElementById('scroll-seal');
    const scrollBody = document.getElementById('scroll-body');
    const scrollContent = document.getElementById('scroll-content');

    if (scrollSeal && scrollBody) {
        function openScroll() {
            if (scrollBody.classList.contains('is-open')) return;
            scrollBody.classList.add('is-open');
            scrollSeal.classList.add('seal-broken');

            // Показываем строки письма одну за другой с задержкой
            const lines = scrollContent.querySelectorAll('.scroll-line, .scroll-divider, .scroll-sig');
            lines.forEach((el, i) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, 400 + i * 120);
            });
        }

        scrollSeal.addEventListener('click', openScroll);
        // Поддержка клавиатуры (Enter / Space)
        scrollSeal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') openScroll();
        });
    }

});
