/* ============================================
   HBD AISYAH - Interactive Birthday Greeting
   ============================================ */

// ==========================================
// CONSTANTS
// ==========================================
const TYPING_TEXT = 'Hai, ada sesuatu untukmu...';
const TYPING_SPEED = 90;
const TAP_INCREMENT = 5;
const MAX_PROGRESS = 100;
const FIREWORK_COLORS = [
    '#ff69b4', '#ff1493', '#ff6eb4', '#ff80ab',
    '#f48fb1', '#ffd700', '#ffb347', '#fff',
    '#fff0f5', '#e91e63', '#ff4081',
];

const STAGE_TEXTS = [
    'Tap awan untuk menyiram~ 🌧️',
    'Tunas mulai muncul! 🌱',
    'Wah, udah tumbuh! 🌿',
    'Kuncupnya muncul! 🌷',
    'Bunganya mekar sempurna!! 🌹✨',
];

// ==========================================
// STATE
// ==========================================
let flowerProgress = 0;
let currentStage = 0;
let fireworksRunning = false;
let fireworksCtx = null;
let fireworksCanvas = null;
let rockets = [];
let particles = [];
let animFrameId = null;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initScene1_Opening();
    initScene2_Flower();
    initScene3_Transition();
    initScene4_Message();
});

// ==========================================
// SCENE MANAGEMENT
// ==========================================
function showScene(sceneName) {
    // Fade out all scenes
    document.querySelectorAll('.scene').forEach(s => {
        s.classList.remove('active');
    });

    // Small delay then show new scene
    setTimeout(() => {
        const newScene = document.getElementById(`scene-${sceneName}`);
        newScene.classList.add('active');

        // Activate scene-specific logic
        switch (sceneName) {
            case 'flower':
                onFlowerSceneActive();
                break;
            case 'transition':
                onTransitionActive();
                break;
            case 'message':
                onMessageActive();
                break;
        }
    }, 400);
}

// ==========================================
// SCENE 1: OPENING
// ==========================================
function initScene1_Opening() {
    createSakuraPetals('floating-petals', 18);
    createSparkles();
    startTypingEffect();

    const btn = document.getElementById('start-btn');
    btn.addEventListener('click', () => {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => showScene('flower'), 200);
    });
}

function createSakuraPetals(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = containerId === 'message-petals' ? 'msg-petal' : 'sakura-petal';

        const size = 8 + Math.random() * 14;
        const pinkShades = ['#ffb6c1', '#ff69b4', '#ffc0cb', '#ff1493', '#f48fb1', '#ff80ab'];
        const color = pinkShades[Math.floor(Math.random() * pinkShades.length)];

        petal.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, ${color}, ${color}88);
            left: ${Math.random() * 100}%;
            --fall-dur: ${5 + Math.random() * 7}s;
            --fall-delay: ${Math.random() * 6}s;
        `;

        container.appendChild(petal);
    }
}

function createSparkles() {
    const container = document.getElementById('sparkle-bg');
    for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.className = 'sparkle-dot';
        dot.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --tw-dur: ${2 + Math.random() * 4}s;
            --tw-delay: ${Math.random() * 3}s;
            width: ${1 + Math.random() * 3}px;
            height: ${1 + Math.random() * 3}px;
        `;
        container.appendChild(dot);
    }
}

function startTypingEffect() {
    const el = document.getElementById('typing-text');
    const cursor = document.getElementById('typing-cursor');
    let i = 0;

    const type = () => {
        if (i < TYPING_TEXT.length) {
            el.textContent += TYPING_TEXT[i];
            i++;
            setTimeout(type, TYPING_SPEED);
        } else {
            // Typing done — show button after a beat
            setTimeout(() => {
                cursor.style.display = 'none';
                document.getElementById('start-btn').classList.add('visible');
            }, 600);
        }
    };

    // Start typing after a short delay
    setTimeout(type, 1200);
}

// ==========================================
// SCENE 2: FLOWER GROWING
// ==========================================
function initScene2_Flower() {
    const cloud = document.getElementById('cloud');

    // Handle both touch and click
    cloud.addEventListener('touchstart', (e) => {
        e.preventDefault();
        onCloudTap();
    }, { passive: false });

    cloud.addEventListener('click', (e) => {
        // Avoid double-fire on touch devices
        if (e.pointerType === 'touch') return;
        onCloudTap();
    });
}

function onFlowerSceneActive() {
    // Reset progress if re-entering
    flowerProgress = 0;
    currentStage = 0;
    const scene = document.getElementById('scene-flower');
    scene.className = 'scene active stage-0';
    updateHeartsUI(0);
    document.getElementById('progress-text').textContent = STAGE_TEXTS[0];
}

function onCloudTap() {
    if (flowerProgress >= MAX_PROGRESS) return;

    flowerProgress = Math.min(flowerProgress + TAP_INCREMENT, MAX_PROGRESS);

    // Animate cloud
    bounceCloud();

    // Create rain
    createRainDrops();

    // Update flower stage
    const newStage = getStage(flowerProgress);
    if (newStage !== currentStage) {
        currentStage = newStage;
        updateFlowerStage(newStage);
        updateHeartsUI(newStage);
    }

    // Update text
    document.getElementById('progress-text').textContent = STAGE_TEXTS[Math.min(newStage, 4)];

    // Check completion
    if (flowerProgress >= MAX_PROGRESS) {
        document.getElementById('cloud-text').textContent = 'Cantiknya~ 🌸';
        // Auto-transition after admiring
        setTimeout(() => showScene('transition'), 2000);
    }
}

function getStage(progress) {
    if (progress >= 100) return 4;
    if (progress >= 75) return 3;
    if (progress >= 50) return 2;
    if (progress >= 25) return 1;
    return 0;
}

function bounceCloud() {
    const cloud = document.getElementById('cloud');
    cloud.style.transform = 'scaleY(0.8) scaleX(1.08)';
    setTimeout(() => {
        cloud.style.transform = '';
    }, 150);
}

function createRainDrops() {
    const cloud = document.getElementById('cloud');
    const rect = cloud.getBoundingClientRect();
    const scene = document.getElementById('scene-flower');

    const dropCount = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = `${rect.left + 15 + Math.random() * (rect.width - 30)}px`;
        drop.style.top = `${rect.bottom - 5}px`;
        drop.style.animationDelay = `${Math.random() * 0.25}s`;
        drop.style.height = `${12 + Math.random() * 10}px`;
        scene.appendChild(drop);

        drop.addEventListener('animationend', () => drop.remove());
    }
}

function updateFlowerStage(stage) {
    const scene = document.getElementById('scene-flower');

    // Remove old stage classes
    for (let i = 0; i <= 4; i++) {
        scene.classList.remove(`stage-${i}`);
    }
    scene.classList.add(`stage-${stage}`);
}

function updateHeartsUI(stage) {
    document.querySelectorAll('.heart').forEach(h => {
        const s = parseInt(h.dataset.stage);
        if (s <= stage) {
            h.textContent = '💗';
            if (s === stage) {
                h.classList.add('filled');
                setTimeout(() => h.classList.remove('filled'), 500);
            }
        } else {
            h.textContent = '🤍';
        }
    });
}

// ==========================================
// SCENE 3: TRANSITION + FIREWORKS
// ==========================================
function initScene3_Transition() {
    fireworksCanvas = document.getElementById('fireworks-canvas');
    fireworksCtx = fireworksCanvas.getContext('2d');

    document.getElementById('continue-btn').addEventListener('click', () => {
        stopFireworks();
        showScene('message');
    });

    window.addEventListener('resize', resizeFireworksCanvas);
}

function onTransitionActive() {
    resizeFireworksCanvas();
    createFlyingPetals();
    createConfetti();

    // Start fireworks
    startFireworks();

    // Reveal text elements with staggered timing
    setTimeout(() => {
        document.querySelector('.transition-sparkle').classList.add('visible');
    }, 500);

    setTimeout(() => {
        document.getElementById('birthday-title').classList.add('visible');
    }, 1000);

    setTimeout(() => {
        document.getElementById('birthday-name').classList.add('visible');
    }, 1800);

    setTimeout(() => {
        document.getElementById('birthday-date').classList.add('visible');
    }, 2200);

    setTimeout(() => {
        document.getElementById('continue-btn').classList.add('visible');
    }, 3500);
}

function resizeFireworksCanvas() {
    if (!fireworksCanvas) return;
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}

function createFlyingPetals() {
    const container = document.getElementById('flying-petals');
    container.innerHTML = '';

    for (let i = 0; i < 25; i++) {
        const petal = document.createElement('div');
        petal.className = 'flying-petal';

        const size = 8 + Math.random() * 16;
        const pinkShades = ['#ffb6c1', '#ff69b4', '#ffc0cb', '#ff1493', '#f48fb1'];
        const color = pinkShades[Math.floor(Math.random() * pinkShades.length)];

        const flyX = (-150 + Math.random() * 300);
        const flyY = (-200 + Math.random() * 400);

        petal.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${30 + Math.random() * 40}%;
            top: ${30 + Math.random() * 40}%;
            --fly-dur: ${2 + Math.random() * 4}s;
            --fly-delay: ${Math.random() * 2}s;
            --fly-x: ${flyX}px;
            --fly-y: ${flyY}px;
        `;

        container.appendChild(petal);
    }
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';

    const confettiColors = ['#ff69b4', '#ffd700', '#ff1493', '#ffb6c1', '#fff', '#f48fb1', '#e91e63', '#ff80ab'];

    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${5 + Math.random() * 6}px;
            height: ${10 + Math.random() * 10}px;
            background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
            --conf-dur: ${2 + Math.random() * 3}s;
            --conf-delay: ${Math.random() * 3}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        container.appendChild(conf);
    }
}

// ==========================================
// FIREWORKS PARTICLE SYSTEM (Canvas)
// ==========================================
function startFireworks() {
    fireworksRunning = true;
    rockets = [];
    particles = [];

    launchFirework();
    animateFireworks();
}

function stopFireworks() {
    fireworksRunning = false;
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

function launchFirework() {
    if (!fireworksRunning) return;

    const w = fireworksCanvas.width;
    const h = fireworksCanvas.height;

    // Launch 1-2 rockets at a time
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
        rockets.push({
            x: w * 0.15 + Math.random() * w * 0.7,
            y: h,
            targetY: h * (0.1 + Math.random() * 0.35),
            speed: 3 + Math.random() * 4,
            color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
            trail: [],
        });
    }

    // Schedule next launch
    setTimeout(launchFirework, 400 + Math.random() * 800);
}

function explodeFirework(x, y, color) {
    const count = 50 + Math.floor(Math.random() * 40);
    const type = Math.random(); // for different explosion patterns

    for (let i = 0; i < count; i++) {
        let angle, speed;

        if (type < 0.3) {
            // Circle burst
            angle = (Math.PI * 2 / count) * i;
            speed = 2 + Math.random() * 4;
        } else if (type < 0.6) {
            // Random spray
            angle = Math.random() * Math.PI * 2;
            speed = 1 + Math.random() * 5;
        } else {
            // Ring burst
            angle = (Math.PI * 2 / count) * i;
            speed = 3 + Math.random() * 1.5;
        }

        // Slight color variation
        const useColor = Math.random() > 0.3
            ? color
            : FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: useColor,
            alpha: 1,
            decay: 0.008 + Math.random() * 0.015,
            size: 1.5 + Math.random() * 2.5,
            gravity: 0.03 + Math.random() * 0.02,
        });
    }
}

function animateFireworks() {
    if (!fireworksRunning && rockets.length === 0 && particles.length === 0) {
        return;
    }

    const ctx = fireworksCtx;
    const w = fireworksCanvas.width;
    const h = fireworksCanvas.height;

    // Fade trail effect
    ctx.fillStyle = 'rgba(10, 0, 8, 0.18)';
    ctx.fillRect(0, 0, w, h);

    // Update & draw rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];

        // Store trail
        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 8) r.trail.shift();

        // Draw trail
        for (let t = 0; t < r.trail.length; t++) {
            const tr = r.trail[t];
            const a = (t / r.trail.length) * 0.6;
            ctx.globalAlpha = a;
            ctx.fillStyle = r.color;
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw rocket head
        ctx.globalAlpha = 1;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Move up
        r.y -= r.speed;
        r.x += (Math.random() - 0.5) * 0.5;

        // Check if reached target
        if (r.y <= r.targetY) {
            explodeFirework(r.x, r.y, r.color);
            rockets.splice(i, 1);
        }
    }

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity; // gravity
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Optional sparkle effect
        if (Math.random() > 0.97) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1;

    animFrameId = requestAnimationFrame(animateFireworks);
}

// ==========================================
// SCENE 4: MESSAGE
// ==========================================
function initScene4_Message() {
    // Intersection Observer for scroll reveal
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || '0');
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    // Don't unobserve — allow re-reveal if scrolled back
                }
            });
        },
        {
            threshold: 0.15,
            root: null,
        }
    );

    document.querySelectorAll('.reveal-item').forEach((el) => {
        observer.observe(el);
    });
}

function onMessageActive() {
    // Create background petals
    createSakuraPetals('message-petals', 12);

    // Scroll to top
    const scroll = document.getElementById('message-scroll');
    if (scroll) scroll.scrollTop = 0;

    // Re-trigger reveals (in case observer already saw them while hidden)
    setTimeout(() => {
        document.querySelectorAll('#scene-message .reveal-item').forEach((el) => {
            el.classList.remove('revealed');
        });
        // Let intersection observer re-detect them
        const scroll = document.getElementById('scene-message');
        if (scroll) {
            scroll.scrollTop = 0;
        }
    }, 100);
}

// ==========================================
// UTILITY: Prevent pull-to-refresh & bounce
// ==========================================
document.addEventListener('touchmove', (e) => {
    // Allow scrolling in message scene
    const messageScene = document.getElementById('scene-message');
    if (messageScene && messageScene.classList.contains('active')) {
        const scroll = document.getElementById('message-scroll');
        if (scroll && scroll.contains(e.target)) {
            return; // Allow scroll
        }
    }
    // Prevent default for other scenes
    if (e.cancelable) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent double-tap zoom on mobile
document.addEventListener('dblclick', (e) => {
    e.preventDefault();
}, { passive: false });
