/**
 * Magic Dock - Interactive Navigation
 * Implements Apple-style magnification scaling using GSAP
 */

(function () {
    const DOCK_CONFIG = {
        baseSize: 48,
        magnification: 85,
        distance: 150,
        spring: {
            duration: 0.4,
            ease: "power2.out"
        }
    };

    window.initMagicDock = function () {
        const dock = document.getElementById('magicDock');
        const items = document.querySelectorAll('.dock-item');
        if (!dock || items.length === 0) return;

        // Mouse move tracking for magnification
        const handleMouseMove = (e) => {
            const mouseX = e.clientX;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;

                // Horizontal distance calculation
                const distance = Math.abs(mouseX - centerX);

                let scale = 1;
                if (distance < DOCK_CONFIG.distance) {
                    // Normalize distance to 0-1 range
                    const normalizedDist = distance / DOCK_CONFIG.distance;
                    // Apply easing curve for magnification (cosine for smooth bell curve)
                    const magnifyFactor = Math.cos(normalizedDist * Math.PI / 2);

                    const targetSize = DOCK_CONFIG.baseSize + (DOCK_CONFIG.magnification - DOCK_CONFIG.baseSize) * magnifyFactor;
                    scale = targetSize / DOCK_CONFIG.baseSize;
                }

                // Apply sizing with GSAP for "springy" feel
                gsap.to(item, {
                    width: DOCK_CONFIG.baseSize * scale,
                    height: DOCK_CONFIG.baseSize * scale,
                    duration: DOCK_CONFIG.spring.duration,
                    ease: DOCK_CONFIG.spring.ease,
                    overwrite: "auto"
                });

                // Scale icon as well
                gsap.to(item.querySelector('i'), {
                    fontSize: (1.2 * scale) + "rem",
                    duration: DOCK_CONFIG.spring.duration,
                    ease: DOCK_CONFIG.spring.ease,
                    overwrite: "auto"
                });
            });
        };

        const handleMouseLeave = () => {
            items.forEach(item => {
                gsap.to(item, {
                    width: DOCK_CONFIG.baseSize,
                    height: DOCK_CONFIG.baseSize,
                    duration: DOCK_CONFIG.spring.duration,
                    ease: DOCK_CONFIG.spring.ease
                });
                gsap.to(item.querySelector('i'), {
                    fontSize: "1.2rem",
                    duration: DOCK_CONFIG.spring.duration,
                    ease: DOCK_CONFIG.spring.ease
                });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        dock.addEventListener('mouseleave', handleMouseLeave);

        // Highlight active section based on scroll
        const updateActiveState = () => {
            const sections = ['about', 'skills', 'projects', 'achievements', 'hobbies', 'resume', 'contact'];
            let current = "";

            sections.forEach(id => {
                const section = document.getElementById(id);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    // If section is roughly in view
                    if (rect.top <= 150) {
                        current = id;
                    }
                }
            });

            items.forEach(item => {
                item.classList.remove('active');
                if (item.onclick.toString().includes(current)) {
                    item.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', updateActiveState);
        updateActiveState(); // Initial call
    };

    // Global helper for scrolling
    window.scrollToSection = function (id) {
        const section = document.getElementById(id);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    };

    // Auto-init when document is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Delay slightly to ensure GSAP is loaded
        setTimeout(window.initMagicDock, 100);
    });

})();
