// Отключаем автоматическое восстановление позиции скролла браузером при обновлении
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
    // Глобальные переменные для SPA-навигации и canvas-частиц
    let currentMonth = 1;
    let updateParticlesColors = null;

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
                this.assignColor();
            }
            assignColor() {
                if (currentMonth === 3) {
                    // Темно-красные, бордовые или пепельные частицы для готической страницы
                    this.color = Math.random() > 0.5 ? 'rgba(186, 12, 47, 0.45)' : 'rgba(74, 14, 23, 0.6)';
                } else {
                    // Розовые/светлые для обычных страниц
                    this.color = Math.random() > 0.5 ? 'rgba(255, 107, 139, 0.4)' : 'rgba(255, 182, 193, 0.6)';
                }
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

        // Breakcore system state
        let bcTime = 0;
        const bcCrackPoints = [];
        // Pre-generate persistent crack impact points (циклично обновляются)
        for (let i = 0; i < 5; i++) {
            bcCrackPoints.push({
                x: Math.random(),
                y: Math.random(),
                rays: Math.floor(Math.random() * 6) + 5,
                angles: [],
                lengths: [],
                branches: []
            });
            for (let j = 0; j < bcCrackPoints[i].rays; j++) {
                bcCrackPoints[i].angles.push((j / bcCrackPoints[i].rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.5);
                bcCrackPoints[i].lengths.push(30 + Math.random() * 180);
                bcCrackPoints[i].branches.push(Math.random() > 0.4 ? { dx: (Math.random() - 0.5) * 60, dy: (Math.random() - 0.5) * 60 } : null);
            }
        }

        function drawBreakcoreGlitch() {
            bcTime += 0.016; // ~60fps increment
            const W = canvas.width;
            const H = canvas.height;

            // Phase oscillators for cyclical intensity
            const phase1 = Math.sin(bcTime * 0.7) * 0.5 + 0.5;  // Slow pulse
            const phase2 = Math.sin(bcTime * 1.3) * 0.5 + 0.5;  // Medium pulse
            const phase3 = Math.sin(bcTime * 2.1) * 0.5 + 0.5;  // Fast pulse
            const phase4 = Math.sin(bcTime * 3.7) * 0.5 + 0.5;  // Rapid flicker
            const phaseBeat = Math.pow(Math.sin(bcTime * 4.0), 8); // Sharp beat pulse

            // ============ LAYER 1: Темная подложка с пульсирующей виньеткой ============
            const vGrad = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.9);
            vGrad.addColorStop(0, `rgba(0, 0, 0, ${0.1 + phaseBeat * 0.15})`);
            vGrad.addColorStop(1, `rgba(0, 0, 0, ${0.4 + phase1 * 0.3})`);
            ctx.fillStyle = vGrad;
            ctx.fillRect(0, 0, W, H);

            // ============ LAYER 2: Горизонтальные scanline-полосы (CRT развертка) ============
            const scanlineCount = Math.floor(3 + phase2 * 8);
            for (let i = 0; i < scanlineCount; i++) {
                const yy = (bcTime * 80 * (i + 1) * 0.3 + i * H / scanlineCount) % H;
                const thickness = 1 + Math.random() * (2 + phase3 * 4);
                const alpha = 0.03 + phase2 * 0.12 + Math.random() * 0.05;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(0, yy, W, thickness);
            }

            // ============ LAYER 3: RGB Channel Separation / Хроматическая аберрация ============
            if (phase4 > 0.6) {
                const shiftAmount = (phase4 - 0.6) * 15;
                // Red channel band
                ctx.fillStyle = `rgba(255, 0, 0, ${0.02 + (phase4 - 0.6) * 0.08})`;
                const rY = (bcTime * 120) % H;
                ctx.fillRect(0, rY - shiftAmount, W, 3 + shiftAmount * 2);
                // Blue channel band  
                ctx.fillStyle = `rgba(0, 100, 255, ${0.02 + (phase4 - 0.6) * 0.06})`;
                const bY = (bcTime * 90 + H * 0.3) % H;
                ctx.fillRect(0, bY + shiftAmount, W, 2 + shiftAmount * 1.5);
            }

            // ============ LAYER 4: Мерцающая сетка (LCD Matrix / Grid) ============
            const gridIntensity = phase1 * phase3;
            if (gridIntensity > 0.3) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + gridIntensity * 0.06})`;
                ctx.lineWidth = 0.5;
                const gridSpacing = 40 + Math.sin(bcTime * 0.5) * 15;
                const gridOffsetX = (bcTime * 10) % gridSpacing;
                const gridOffsetY = (bcTime * 7) % gridSpacing;
                ctx.beginPath();
                for (let x = gridOffsetX; x < W; x += gridSpacing) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, H);
                }
                for (let y = gridOffsetY; y < H; y += gridSpacing) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(W, y);
                }
                ctx.stroke();
            }

            // ============ LAYER 5: Трещины битого стекла (persistent cracks) ============
            const crackAlpha = 0.08 + phase1 * 0.22 + phaseBeat * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${crackAlpha})`;
            ctx.lineWidth = 0.8 + phase3 * 0.8;
            for (let c = 0; c < bcCrackPoints.length; c++) {
                const cp = bcCrackPoints[c];
                // Циклически двигаем точку удара
                const cx = cp.x * W + Math.sin(bcTime * 0.3 + c * 1.5) * 30;
                const cy = cp.y * H + Math.cos(bcTime * 0.25 + c * 2.0) * 25;
                ctx.beginPath();
                for (let j = 0; j < cp.rays; j++) {
                    const wobble = Math.sin(bcTime * 1.5 + j + c) * 0.08;
                    const angle = cp.angles[j] + wobble;
                    const len = cp.lengths[j] * (0.6 + phase1 * 0.4 + phaseBeat * 0.3);
                    const x2 = cx + Math.cos(angle) * len;
                    const y2 = cy + Math.sin(angle) * len;
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(x2, y2);
                    if (cp.branches[j]) {
                        ctx.lineTo(x2 + cp.branches[j].dx * (0.5 + phase2 * 0.5), y2 + cp.branches[j].dy * (0.5 + phase2 * 0.5));
                    }
                }
                ctx.stroke();
            }

            // ============ LAYER 6: Glitch displacement blocks ============
            if (phaseBeat > 0.3 || Math.random() > 0.92) {
                const blockCount = Math.floor(1 + phaseBeat * 4 + Math.random() * 2);
                for (let i = 0; i < blockCount; i++) {
                    const bx = Math.random() * W;
                    const by = Math.random() * H;
                    const bw = 20 + Math.random() * (W * 0.4);
                    const bh = 2 + Math.random() * 15;
                    const shiftX = (Math.random() - 0.5) * 30 * (1 + phaseBeat);
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.08})`;
                    ctx.fillRect(bx + shiftX, by, bw, bh);
                    // Инверсная полоса
                    if (Math.random() > 0.5) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + Math.random() * 0.4})`;
                        ctx.fillRect(bx, by + bh, bw * 0.7, bh * 0.6);
                    }
                }
            }

            // ============ LAYER 7: Осциллограф / Waveform ============
            const waveAlpha = 0.06 + phase2 * 0.14;
            ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha})`;
            ctx.lineWidth = 1 + phase3 * 0.5;
            const waveCount = 2 + Math.floor(phase1 * 2);
            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                const baseY = H * (0.2 + w * 0.25);
                const freq = 0.008 + phase2 * 0.012 + w * 0.003;
                const amp = 15 + phase3 * 40 + phaseBeat * 20;
                for (let x = 0; x < W; x += 3) {
                    const y = baseY + Math.sin(x * freq + bcTime * (2 + w)) * amp
                              + Math.sin(x * freq * 3.7 + bcTime * 5) * amp * 0.2;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // ============ LAYER 8: Цифровой шум (pixel noise burst) ============
            const noiseIntensity = 3 + phase3 * 10 + phaseBeat * 15;
            for (let i = 0; i < noiseIntensity; i++) {
                const px = Math.random() * W;
                const py = Math.random() * H;
                const pSize = 1 + Math.random() * (3 + phaseBeat * 6);
                const pAlpha = 0.08 + Math.random() * 0.2;
                ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
                ctx.fillRect(px, py, pSize, pSize);
            }

            // ============ LAYER 9: Быстрые вспышки (strobe on beat) ============
            if (phaseBeat > 0.85) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + (phaseBeat - 0.85) * 0.15})`;
                ctx.fillRect(0, 0, W, H);
            }

            // ============ LAYER 10: Вертикальные глитч-полосы (VHS tracking) ============
            if (phase4 > 0.45) {
                const stripCount = Math.floor(2 + (phase4 - 0.45) * 8);
                for (let i = 0; i < stripCount; i++) {
                    const sx = Math.random() * W;
                    const sw = 1 + Math.random() * 4;
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.06})`;
                    ctx.fillRect(sx, 0, sw, H);
                }
            }

            // ============ LAYER 11: Мерцающие диагональные линии ============
            if (phase1 > 0.5 && Math.random() > 0.7) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + (phase1 - 0.5) * 0.1})`;
                ctx.lineWidth = 0.5 + Math.random();
                ctx.beginPath();
                const diagCount = Math.floor(1 + phase1 * 3);
                for (let d = 0; d < diagCount; d++) {
                    const startX = Math.random() * W;
                    const startY = Math.random() * H;
                    const len = 50 + Math.random() * 200;
                    const angle = Math.PI * 0.25 + (Math.random() - 0.5) * 0.3;
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX + Math.cos(angle) * len, startY + Math.sin(angle) * len);
                }
                ctx.stroke();
            }

            // ============ LAYER 12: Статические шумовые горизонтальные полосы (cyclical) ============
            const staticBandY = (bcTime * 50) % (H + 100) - 50;
            const bandHeight = 30 + Math.sin(bcTime * 2.3) * 20;
            if (bandHeight > 10) {
                for (let sy = staticBandY; sy < staticBandY + bandHeight; sy += 2) {
                    if (sy < 0 || sy > H) continue;
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.01 + Math.random() * 0.04})`;
                    ctx.fillRect(0, sy, W, 1);
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Main canvas always draws heart particles (for pages 1 & 2)
            // Breakcore runs on its own dedicated canvas inside gothic-view
            if (currentMonth !== 3) {
                for (let i = 0; i < particlesArray.length; i++) {
                    particlesArray[i].update();
                    particlesArray[i].draw();
                }
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        updateParticlesColors = () => {
            particlesArray.forEach(p => p.assignColor());
        };
    }

    // ==================================================================== //
    // 3.5. BREAKCORE CANVAS (Dedicated background for Page 3)
    // ==================================================================== //
    const bcCanvas = document.getElementById('breakcore-canvas');
    if (bcCanvas) {
        const bcCtx = bcCanvas.getContext('2d');
        const gothicView = document.getElementById('month3-view');
        
        function resizeBcCanvas() {
            if (gothicView) {
                bcCanvas.width = gothicView.offsetWidth;
                bcCanvas.height = gothicView.scrollHeight || gothicView.offsetHeight;
            }
        }
        resizeBcCanvas();
        window.addEventListener('resize', resizeBcCanvas);
        // Also resize when switching to month 3 (content may have different height)
        const bcResizeObserver = new ResizeObserver(() => resizeBcCanvas());
        if (gothicView) bcResizeObserver.observe(gothicView);

        // Breakcore system state for dedicated canvas
        let bcTime2 = 0;
        const bcCracks2 = [];
        for (let i = 0; i < 7; i++) {
            const cp = {
                x: Math.random(),
                y: Math.random(),
                rays: Math.floor(Math.random() * 7) + 4,
                angles: [],
                lengths: [],
                branches: []
            };
            for (let j = 0; j < cp.rays; j++) {
                cp.angles.push((j / cp.rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.6);
                cp.lengths.push(40 + Math.random() * 200);
                cp.branches.push(Math.random() > 0.35 ? { dx: (Math.random() - 0.5) * 70, dy: (Math.random() - 0.5) * 70 } : null);
            }
            bcCracks2.push(cp);
        }

        function drawBcBackground() {
            bcTime2 += 0.016;
            const W = bcCanvas.width;
            const H = bcCanvas.height;
            if (W === 0 || H === 0) return;

            bcCtx.clearRect(0, 0, W, H);

            const p1 = Math.sin(bcTime2 * 0.7) * 0.5 + 0.5;
            const p2 = Math.sin(bcTime2 * 1.3) * 0.5 + 0.5;
            const p3 = Math.sin(bcTime2 * 2.1) * 0.5 + 0.5;
            const p4 = Math.sin(bcTime2 * 3.7) * 0.5 + 0.5;
            const beat = Math.pow(Math.sin(bcTime2 * 4.0), 8);

            // Dark vignette pulse
            const vg = bcCtx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.8);
            vg.addColorStop(0, `rgba(0,0,0,${0.05 + beat * 0.1})`);
            vg.addColorStop(1, `rgba(0,0,0,${0.3 + p1 * 0.25})`);
            bcCtx.fillStyle = vg;
            bcCtx.fillRect(0, 0, W, H);

            // Horizontal scanlines (crawling)
            const scanCount = Math.floor(4 + p2 * 10);
            for (let i = 0; i < scanCount; i++) {
                const yy = (bcTime2 * 60 * (i + 1) * 0.25 + i * H / scanCount) % H;
                const thick = 1 + Math.random() * (2 + p3 * 3);
                bcCtx.fillStyle = `rgba(255,255,255,${0.025 + p2 * 0.08 + Math.random() * 0.04})`;
                bcCtx.fillRect(0, yy, W, thick);
            }

            // RGB aberration bands
            if (p4 > 0.55) {
                const shift = (p4 - 0.55) * 18;
                bcCtx.fillStyle = `rgba(255,30,30,${0.015 + (p4 - 0.55) * 0.06})`;
                bcCtx.fillRect(0, (bcTime2 * 100) % H, W, 3 + shift * 2);
                bcCtx.fillStyle = `rgba(30,80,255,${0.012 + (p4 - 0.55) * 0.05})`;
                bcCtx.fillRect(0, (bcTime2 * 75 + H * 0.4) % H, W, 2 + shift * 1.5);
            }

            // Flowing grid
            const gi = p1 * p3;
            if (gi > 0.25) {
                bcCtx.strokeStyle = `rgba(255,255,255,${0.015 + gi * 0.045})`;
                bcCtx.lineWidth = 0.4;
                const sp = 45 + Math.sin(bcTime2 * 0.4) * 12;
                const ox = (bcTime2 * 8) % sp;
                const oy = (bcTime2 * 6) % sp;
                bcCtx.beginPath();
                for (let x = ox; x < W; x += sp) { bcCtx.moveTo(x, 0); bcCtx.lineTo(x, H); }
                for (let y = oy; y < H; y += sp) { bcCtx.moveTo(0, y); bcCtx.lineTo(W, y); }
                bcCtx.stroke();
            }

            // Persistent cracks
            const ca = 0.06 + p1 * 0.18 + beat * 0.12;
            bcCtx.strokeStyle = `rgba(255,255,255,${ca})`;
            bcCtx.lineWidth = 0.7 + p3 * 0.7;
            for (let c = 0; c < bcCracks2.length; c++) {
                const cp = bcCracks2[c];
                const cx = cp.x * W + Math.sin(bcTime2 * 0.25 + c * 1.7) * 25;
                const cy = cp.y * H + Math.cos(bcTime2 * 0.2 + c * 2.3) * 20;
                bcCtx.beginPath();
                for (let j = 0; j < cp.rays; j++) {
                    const wobble = Math.sin(bcTime2 * 1.2 + j + c) * 0.06;
                    const angle = cp.angles[j] + wobble;
                    const len = cp.lengths[j] * (0.5 + p1 * 0.5 + beat * 0.25);
                    const x2 = cx + Math.cos(angle) * len;
                    const y2 = cy + Math.sin(angle) * len;
                    bcCtx.moveTo(cx, cy);
                    bcCtx.lineTo(x2, y2);
                    if (cp.branches[j]) {
                        bcCtx.lineTo(x2 + cp.branches[j].dx * (0.4 + p2 * 0.6), y2 + cp.branches[j].dy * (0.4 + p2 * 0.6));
                    }
                }
                bcCtx.stroke();
            }

            // Glitch blocks
            if (beat > 0.25 || Math.random() > 0.93) {
                const cnt = Math.floor(1 + beat * 5 + Math.random() * 2);
                for (let i = 0; i < cnt; i++) {
                    const bx = Math.random() * W;
                    const by = Math.random() * H;
                    const bw = 15 + Math.random() * (W * 0.35);
                    const bh = 2 + Math.random() * 12;
                    bcCtx.fillStyle = `rgba(255,255,255,${0.025 + Math.random() * 0.07})`;
                    bcCtx.fillRect(bx + (Math.random() - 0.5) * 25 * (1 + beat), by, bw, bh);
                    if (Math.random() > 0.5) {
                        bcCtx.fillStyle = `rgba(0,0,0,${0.25 + Math.random() * 0.35})`;
                        bcCtx.fillRect(bx, by + bh, bw * 0.6, bh * 0.5);
                    }
                }
            }

            // Oscilloscope waves
            const wa = 0.04 + p2 * 0.1;
            bcCtx.strokeStyle = `rgba(255,255,255,${wa})`;
            bcCtx.lineWidth = 0.8 + p3 * 0.4;
            const wc = 2 + Math.floor(p1 * 3);
            for (let w = 0; w < wc; w++) {
                bcCtx.beginPath();
                const baseY = H * (0.15 + w * 0.22);
                const freq = 0.006 + p2 * 0.01 + w * 0.002;
                const amp = 12 + p3 * 35 + beat * 18;
                for (let x = 0; x < W; x += 4) {
                    const y = baseY + Math.sin(x * freq + bcTime2 * (1.8 + w)) * amp
                              + Math.sin(x * freq * 3.2 + bcTime2 * 4.5) * amp * 0.18;
                    if (x === 0) bcCtx.moveTo(x, y);
                    else bcCtx.lineTo(x, y);
                }
                bcCtx.stroke();
            }

            // Pixel noise
            const ni = 4 + p3 * 12 + beat * 18;
            for (let i = 0; i < ni; i++) {
                const sz = 1 + Math.random() * (3 + beat * 5);
                bcCtx.fillStyle = `rgba(255,255,255,${0.06 + Math.random() * 0.15})`;
                bcCtx.fillRect(Math.random() * W, Math.random() * H, sz, sz);
            }

            // Beat strobe
            if (beat > 0.85) {
                bcCtx.fillStyle = `rgba(255,255,255,${0.015 + (beat - 0.85) * 0.12})`;
                bcCtx.fillRect(0, 0, W, H);
            }

            // Vertical VHS strips
            if (p4 > 0.4) {
                const sc = Math.floor(2 + (p4 - 0.4) * 6);
                for (let i = 0; i < sc; i++) {
                    bcCtx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.05})`;
                    bcCtx.fillRect(Math.random() * W, 0, 1 + Math.random() * 3, H);
                }
            }

            // Crawling static band
            const bandY = (bcTime2 * 40) % (H + 80) - 40;
            const bHeight = 25 + Math.sin(bcTime2 * 1.8) * 18;
            if (bHeight > 8) {
                for (let sy = bandY; sy < bandY + bHeight; sy += 2) {
                    if (sy < 0 || sy > H) continue;
                    bcCtx.fillStyle = `rgba(255,255,255,${0.008 + Math.random() * 0.03})`;
                    bcCtx.fillRect(0, sy, W, 1);
                }
            }
        }

        // Animate breakcore canvas only when month 3 is visible
        let bcAnimId = null;
        function animateBreakcore() {
            if (currentMonth === 3) {
                drawBcBackground();
            }
            bcAnimId = requestAnimationFrame(animateBreakcore);
        }
        animateBreakcore();
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
    // 8. SPA НАВИГАЦИЯ (ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ)
    // ==================================================================== //
    const navLeft = document.getElementById('nav-left');
    const navRight = document.getElementById('nav-right');
    
    const monthViews = [
        document.getElementById('month1-view'),
        document.getElementById('month2-view'),
        document.getElementById('month3-view')
    ];

    function switchMonth(toMonth) {
        if (toMonth < 1 || toMonth > monthViews.length || currentMonth === toMonth) return;

        const currentView = monthViews[currentMonth - 1];
        const targetView = monthViews[toMonth - 1];
        const goingForward = toMonth > currentMonth;

        // Плавно скроллим страницу на самый верх
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Небольшая задержка, чтобы скролл успел начаться перед сменой контента
        setTimeout(() => {
            if (goingForward) {
                // Текущий уезжает влево
                if (currentView) {
                    currentView.classList.remove('active', 'exit-right');
                    currentView.classList.add('exit-left');
                }
                // Новый приезжает справа
                if (targetView) {
                    targetView.classList.remove('exit-left', 'exit-right');
                    targetView.classList.add('active');
                }
            } else {
                // Текущий уезжает вправо
                if (currentView) {
                    currentView.classList.remove('active', 'exit-left');
                    currentView.classList.add('exit-right');
                }
                // Новый приезжает слева
                if (targetView) {
                    targetView.classList.remove('exit-left', 'exit-right');
                    targetView.classList.add('active');
                }
            }

            currentMonth = toMonth;
            
            // Обновляем видимость навигационных стрелок
            updateNavArrows();

            // Динамически перекрашиваем сердечки на фоне под тему страницы
            if (updateParticlesColors) {
                updateParticlesColors();
            }
        }, 150);
    }

    function updateNavArrows() {
        if (!navLeft || !navRight) return;

        if (currentMonth === 1) {
            navLeft.style.display = 'none';
        } else {
            navLeft.style.display = 'flex';
        }

        if (currentMonth === monthViews.length) {
            navRight.style.display = 'none';
        } else {
            navRight.style.display = 'flex';
        }

        // Применяем готический стиль для стрелок на последней странице
        if (currentMonth === monthViews.length) {
            navLeft.classList.add('gothic-arrow');
            navRight.classList.add('gothic-arrow');
        } else {
            navLeft.classList.remove('gothic-arrow');
            navRight.classList.remove('gothic-arrow');
        }
    }

    // Инициализируем стрелки при первой загрузке
    updateNavArrows();

    if (navRight) navRight.addEventListener('click', () => switchMonth(currentMonth + 1));
    if (navLeft) navLeft.addEventListener('click', () => switchMonth(currentMonth - 1));

    // Поддержка свайпов на мобильных устройствах
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipeGesture() {
        const swipeThreshold = 60; // Минимальная дистанция в пикселях для свайпа
        if (touchEndX < touchStartX - swipeThreshold) {
            // Свайп влево -> следующая страница
            if (currentMonth < monthViews.length) {
                switchMonth(currentMonth + 1);
            }
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Свайп вправо -> предыдущая страница
            if (currentMonth > 1) {
                switchMonth(currentMonth - 1);
            }
        }
    }

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        // Проверяем, не происходит ли свайп внутри интерактивных областей
        // (слайдер карточек, космос-кликер, музыкальные фреймы)
        if (
            e.target.closest('.love-cards-container') || 
            e.target.closest('#cards-wrapper') || 
            e.target.closest('.space-container') ||
            e.target.closest('.spotify-grid') ||
            e.target.closest('iframe')
        ) {
            return;
        }
        
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });

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
            `...за то, что напоминаю про "сученыш". Прости дурака ${svgSadFace}`
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
        const startDate = new Date('2026-03-24T00:00:00');
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
    // 14.5. ГОТИЧЕСКИЙ ТАЙМЕР ОБРАТНОГО / ПРЯМОГО ОТСЧЕТА (17.06.2026)
    // ==================================================================== //
    function updateCountdownTimer() {
        const targetDate = new Date('2026-06-17T00:00:00');
        const now = new Date();
        let diff = targetDate - now;
        let isPast = false;

        if (diff <= 0) {
            diff = Math.abs(diff);
            isPast = true;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        const pad = (n) => String(n).padStart(2, '0');

        // Обновляем тексты заголовков в зависимости от того, наступила ли дата
        const titleEl = document.getElementById('countdown-title');
        const subtitleEl = document.getElementById('countdown-subtitle');

        if (titleEl) {
            titleEl.textContent = isPast ? "Время после 17 июня" : "Обратный отсчет до 17 июня";
        }
        if (subtitleEl) {
            subtitleEl.textContent = isPast ? "Каждое мгновение с того дня стало вечностью..." : "Время замерло в ожидании...";
        }

        const dEl = document.getElementById('countdown-days');
        const hEl = document.getElementById('countdown-hours');
        const mEl = document.getElementById('countdown-minutes');
        const sEl = document.getElementById('countdown-seconds');

        if (dEl) dEl.textContent = days;
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(minutes);
        if (sEl) sEl.textContent = pad(seconds);
    }

    updateCountdownTimer();
    setInterval(updateCountdownTimer, 1000);

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
