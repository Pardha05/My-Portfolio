(() => {
  const slugs = [
    "typescript", "javascript", "dart", "java", "react", "flutter",
    "android", "html5", "css3", "express", "prisma", "amazonaws", 
    "postgresql", "firebase", "nginx", "vercel", "jest", "cypress", 
    "docker", "git", "jira", "github", "gitlab", "sonarqube", "figma"
  ];

  function initCloud() {
    const container = document.getElementById('icon-cloud-container');
    if (!container) {
      setTimeout(initCloud, 500); // retry if not yet rendered
      return;
    }

    container.innerHTML = '';
    const radius = 100; // Sphere radius
    let mouseX = 0;
    let mouseY = 0;
    let autoRotate = true;

    // Create a 3D scene container
    const scene = document.createElement('div');
    scene.style.position = 'absolute';
    scene.style.width = '100%';
    scene.style.height = '100%';
    scene.style.transformStyle = 'preserve-3d';
    scene.style.transition = 'transform 0.1s linear';
    container.appendChild(scene);

    const icons = [];
    const N = slugs.length;
    
    // Distribute points on sphere using Fibonacci spiral
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = 2.39996323 * i;
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const img = document.createElement('img');
      img.src = `https://cdn.simpleicons.org/${slugs[i]}`;
      img.style.position = 'absolute';
      img.style.left = '50%';
      img.style.top = '50%';
      img.style.width = '32px';
      img.style.height = '32px';
      img.style.marginTop = '-16px';
      img.style.marginLeft = '-16px';
      img.style.transformOrigin = 'center center';
      // Prevent drag
      img.draggable = false;
      
      scene.appendChild(img);
      
      icons.push({
        el: img,
        x: x * radius,
        y: y * radius,
        z: z * radius
      });
    }

    let angleX = 0;
    let angleY = 0;

    container.addEventListener('mousemove', (e) => {
      autoRotate = false;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      // Calculate delta (slowed down for smoother interaction)
      mouseX = (e.clientX - cx) * 0.001;
      mouseY = (e.clientY - cy) * 0.001;
    });

    container.addEventListener('mouseleave', () => {
      autoRotate = true;
    });

    function animate() {
      if (autoRotate) {
        mouseX = 0.003;
        mouseY = 0.0015;
      }

      angleX += mouseY;
      angleY -= mouseX;

      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);

      icons.forEach(icon => {
        // Rotate around X
        const y1 = icon.y * cosX - icon.z * sinX;
        const z1 = icon.y * sinX + icon.z * cosX;
        
        // Rotate around Y
        const x2 = icon.x * cosY - z1 * sinY;
        const z2 = icon.x * sinY + z1 * cosY;

        // Perspective projection
        const perspective = 300;
        const scale = perspective / (perspective + z2);
        
        // Render
        icon.el.style.transform = `translate3d(${x2}px, ${y1}px, ${z2}px) scale(${scale})`;
        
        // Fade out icons in back, also handle z-index roughly
        const alpha = Math.max(0.1, Math.min(1, scale));
        icon.el.style.opacity = alpha;
        icon.el.style.zIndex = Math.floor(scale * 100);
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Expose globally
  window.initIconCloud = initCloud;

  // Initial call (will retry if container not ready)
  initCloud();
})();
