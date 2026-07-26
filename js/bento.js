/**
 * MAGIC BENTO LOGIC
 * Ported from React to Vanilla JS with GSAP
 */

document.addEventListener('DOMContentLoaded', () => {
    initMagicBento();
});

window.initMagicBento = function () {
    const cards = document.querySelectorAll('.magic-card');
    if (cards.length === 0) return;

    // ── Global Spotlight ──
    let spotlight = document.querySelector('.global-spotlight');
    if (!spotlight) {
        spotlight = document.createElement('div');
        spotlight.className = 'global-spotlight';
        document.body.appendChild(spotlight);
    }

    const spotlightConfig = {
        radius: 300,
        proximity: 100,
        fadeDistance: 200
    };

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ── Device-Specific Glow Update ──
    const updateGlow = (clientX, clientY) => {
        let isAnyCardNear = false;
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.hypot(clientX - centerX, clientY - centerY) - Math.max(rect.width, rect.height) / 2;
            const effectiveDistance = Math.max(0, distance);

            let intensity = 0;
            if (effectiveDistance <= spotlightConfig.proximity) {
                intensity = 1;
                isAnyCardNear = true;
            } else if (effectiveDistance <= spotlightConfig.fadeDistance) {
                intensity = (spotlightConfig.fadeDistance - effectiveDistance) / (spotlightConfig.fadeDistance - spotlightConfig.proximity);
                isAnyCardNear = true;
            }

            const relX = ((clientX - rect.left) / rect.width) * 100;
            const relY = ((clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--magic-glow-x', `${relX}%`);
            card.style.setProperty('--magic-glow-y', `${relY}%`);
            card.style.setProperty('--magic-glow-intensity', intensity);
        });

        if (isAnyCardNear) {
            gsap.to(spotlight, { left: clientX, top: clientY, opacity: 0.8, duration: 0.2, ease: 'power2.out' });
        } else {
            gsap.to(spotlight, { opacity: 0, duration: 0.5 });
        }
    };

    if (isMobile) {
        // AUTOMATIC SCROLL TRIGGERS FOR MOBILE
        window.addEventListener('scroll', () => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            updateGlow(centerX, centerY);
        });
        // Initial run
        setTimeout(() => updateGlow(window.innerWidth / 2, window.innerHeight / 2), 500);
    } else {
        // HOVER TRIGGERS FOR PC
        window.removeEventListener('mousemove', window._magicMoveHandler);
        window._magicMoveHandler = (e) => updateGlow(e.clientX, e.clientY);
        window.addEventListener('mousemove', window._magicMoveHandler);
    }

    // ── Card Effects: Tilt, Magnetism, Particles ──
    cards.forEach(card => {
        if (card.dataset.magicBound) return;
        card.dataset.magicBound = "true";

        let particles = [];
        let pTimeout = null;

        // TILT & MAGNETISM
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Tilt
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.1,
                ease: 'power2.out',
                transformPerspective: 1000
            });

            // Magnetism (subtle shift)
            const moveX = (x - centerX) * 0.1;
            const moveY = (y - centerY) * 0.1;
            gsap.to(card, { x: moveX, y: moveY, duration: 0.3 });
        });

        card.addEventListener('mouseleave', () => {
            if (window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) return;
            gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.5 });
            stopParticles(card, particles);
        });

        card.addEventListener('mouseenter', () => {
            if (window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) return;
            startParticles(card, (p) => particles.push(p));
        });

        // CLICK RIPPLE
        card.addEventListener('click', (e) => {
            createRipple(card, e);
        });
    });
}

function startParticles(card, addFn) {
    const count = 8;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const rect = card.getBoundingClientRect();
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.background = 'var(--accent)';
            p.style.opacity = '0.6';
            p.style.left = `${Math.random() * rect.width}px`;
            p.style.top = `${Math.random() * rect.height}px`;
            card.appendChild(p);
            addFn(p);

            gsap.fromTo(p,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3 }
            );

            gsap.to(p, {
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50,
                opacity: 0,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }, i * 150);
    }
}

function stopParticles(card, particles) {
    particles.forEach(p => {
        gsap.to(p, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            onComplete: () => p.remove()
        });
    });
    particles.length = 0;
}

function createRipple(card, e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(107, 138, 173, 0.4);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 5;
    `;
    card.appendChild(ripple);

    gsap.to(ripple, {
        scale: 200,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
    });
}
