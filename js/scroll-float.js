document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Target all section titles to apply the floating text effect
  const floatContainers = document.querySelectorAll('.section-title');

  floatContainers.forEach((container) => {
    // Preserve existing classes (like reveal-up) but ensure it functions as the container
    container.classList.add('overflow-hidden');
    
    // We only want to split the immediate text node, just in case there are inner elements.
    // For safety, let's grab inner text.
    const text = container.textContent.trim();
    container.innerHTML = ''; // clear original text

    const textSpan = document.createElement('span');
    textSpan.className = 'inline-block text-[clamp(1.6rem,4vw,3rem)] leading-[1.5]';
    
    // Split text into span elements
    text.split('').forEach(char => {
      const charSpan = document.createElement('span');
      charSpan.className = 'inline-block word';
      charSpan.textContent = char === ' ' ? '\u00A0' : char;
      charSpan.style.display = 'inline-block'; // Required for transform
      textSpan.appendChild(charSpan);
    });

    container.appendChild(textSpan);

    const charElements = textSpan.querySelectorAll('.inline-block.word');

    gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%'
      },
      {
        duration: 1,
        ease: 'back.inOut(2)',
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: 0.03,
        scrollTrigger: {
          trigger: container,
          start: 'center bottom+=20%',
          end: 'bottom bottom-=20%',
          scrub: true
        }
      }
    );
  });
});
