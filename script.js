document.addEventListener("DOMContentLoaded", () => {
    
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

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        if (body.classList.contains('light-theme')) {
            themeBtn.textContent = '🌙'; 
        } else {
            themeBtn.textContent = '☀️'; 
        }
    });

    // ==================================================================== //
    // 5. ИНТЕРАКТИВНАЯ РОМАШКА С КУЛАКОМ
    // ==================================================================== //
    const daisyContainer = document.getElementById('daisy-container');
    const daisyResult = document.getElementById('daisy-result');
    const fistAnimation = document.getElementById('fist-animation');
    
    if (daisyContainer) {
        const petalCount = 14; // Количество лепестков
        const angleStep = 360 / petalCount;
        let petalsLeft = petalCount;
        let isFistAnimating = false; // Блокировка кликов во время анимации кулака
        
        // Начальный вариант случайный, далее будет строгое чередование
        let nextLoves = Math.random() > 0.5;

        for(let i=0; i < petalCount; i++) {
            const p = document.createElement('div');
            p.classList.add('petal');
            // Вращаем лепестки по кругу
            p.style.transform = `rotate(${i * angleStep}deg)`;
            daisyContainer.appendChild(p);

            p.addEventListener('click', () => {
                if (isFistAnimating || p.classList.contains('fallen')) return;
                
                p.style.transform = `rotate(${i * angleStep}deg) translateY(-140px) scale(0.6) rotate(60deg)`;
                p.style.opacity = '0';
                p.classList.add('fallen');
                petalsLeft--;

                // Берем текущий вариант и сразу меняем на противоположный для следующего раза
                let loves = nextLoves;
                nextLoves = !nextLoves;
                
                if (loves) {
                    daisyResult.innerHTML = `<span>Любит! 🥰</span>`;
                    
                    if (petalsLeft === 0) {
                        setTimeout(() => {
                            daisyResult.innerHTML = `<span>Моя любовь безусловна! 💖</span>`;
                        }, 2500);
                    }
                } else {
                    if (petalsLeft === 0) {
                        isFistAnimating = true;
                        daisyResult.innerHTML = `<span class="not-word">Не&nbsp;</span><span class="loves-text">любит 😢</span>`;
                        
                        setTimeout(() => {
                            fistAnimation.classList.add('fist-punch');
                            
                            setTimeout(() => {
                                const notWord = document.querySelector('.not-word');
                                if (notWord) notWord.classList.add('shattered'); 
                                
                                const lovesText = document.querySelector('.loves-text');
                                if (lovesText) lovesText.innerHTML = `любит! 🥰 <br><span style="font-size:1.2rem; opacity:0.8; display:block;">(а вариантов нет!)</span>`;
                                
                                setTimeout(() => {
                                    fistAnimation.classList.remove('fist-punch');
                                    isFistAnimating = false; 
                                    
                                    setTimeout(() => {
                                        daisyResult.innerHTML = `<span>Моя любовь безусловна! 💖</span>`;
                                    }, 2500);
                                }, 800);
                                
                            }, 250); 
                        }, 500); 
                    } else {
                        daisyResult.innerHTML = `<span>Не любит 😢</span>`;
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
    const maxClicks = 20; // 20 кликов до взрыва!
    let hasExploded = false;

    if (pinata) {
        pinata.addEventListener('click', (e) => {
            if (hasExploded) return;
            
            clicks++;
            
            // Анимация дергания (уменьшаем на миг, потом JS и CSS вернут)
            pinata.classList.add('pop');
            setTimeout(() => pinata.classList.remove('pop'), 50);

            // Увеличиваем масштаб сердечка с каждым кликом (оно "надувается")
            let scale = 1 + (clicks * 0.05);
            let percent = Math.floor((clicks / maxClicks) * 100);
            
            pinataCounter.textContent = percent + '%';
            // Применяем увеличение
            pinata.style.transform = `scale(${scale})`; 
            
            if (clicks >= maxClicks) {
                hasExploded = true;
                pinataCounter.textContent = '∞%';
                pinataResult.innerHTML = 'Моя любовь к тебе бесконечна! 🌌💕';
                pinata.innerHTML = '❤️‍🔥';
                
                // Эффект взрыва множества маленьких сердечек
                for (let i = 0; i < 30; i++) {
                    createMiniHeart();
                }
                
                // Возвращаем размер обратно и придаем эффект пульсации
                pinata.style.transform = 'scale(1.2)';
            }
        });
        
        function createMiniHeart() {
            const heart = document.createElement('div');
            heart.classList.add('mini-heart');
            const emojis = ['💖', '💕', '💘', '🥰', '✨'];
            heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Физика разброса
            const angle = Math.random() * Math.PI * 2;
            const velocity = 100 + Math.random() * 200; // Насколько далеко отлетят
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            const rot = Math.random() * 360;
            
            // Передаем уникальные координаты в CSS через переменные
            heart.style.setProperty('--tx', `${tx}px`);
            heart.style.setProperty('--ty', `${ty}px`);
            heart.style.setProperty('--rot', `${rot}deg`);
            
            // Анимация разлета длится от 0.6 до 1.1 секунды
            heart.style.animation = `explodeHeart ${0.6 + Math.random() * 0.5}s ease-out forwards`;
            
            pinataContainer.appendChild(heart);
            
            // Убираем мусор из HTML после анимации
            setTimeout(() => {
                heart.remove();
            }, 1200);
        }
    }

    // ==================================================================== //
    // 7. ИНИЦИАЛИЗАЦИЯ И ПОДДЕРЖКА КРАСИВЫХ TWEMOJI (СТИЛЬ iOS/DISCORD)
    // ==================================================================== //
    if (window.twemoji) {
        // Заменяем все эмодзи при первичной загрузке страницы
        twemoji.parse(document.body, {
            folder: 'svg',
            ext: '.svg'
        });

        // Поскольку мы добавляем некоторые эмодзи динамически (ромашка, пиньята),
        // нам нужно следить за добавлением новых элементов и заменять их тоже.
        const observer = new MutationObserver((mutations) => {
            let shouldParse = false;
            for (let mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldParse = true;
                    break;
                }
            }
            if (shouldParse) {
                twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

});
