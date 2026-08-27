document.addEventListener('DOMContentLoaded', () => {
  const terminalContent = document.getElementById('terminal-content');
  if (!terminalContent) return;

  // The lines to animate.
  // We'll use a mix of 'type' (typing character by character) and 'pop' (appearing instantly).
  const lines = [
    { type: 'type', text: '> node about.js', class: 'text-muted' },
    { type: 'pop', text: 'const developer = {', class: 'code-keyword' },
    { type: 'pop', text: '  name: "Pardha Sai",', class: 'code-string' },
    { type: 'pop', text: '  role: "Student Developer | Open to Internships & Startup Opportunities",', class: 'code-string' },
    { type: 'pop', text: '  focus: "Solving real-world problems with technology",', class: 'code-string' },
    { type: 'pop', text: '  seeking: "Internships, collaborations, and investors",', class: 'code-string' },
    { type: 'pop', text: '  passion: "Building and growing my own company",', class: 'code-string' },
    { type: 'pop', text: '  learn() {', class: 'code-method' },
    { type: 'pop', text: '    return "Always learning, always building.";', class: 'code-string' },
    { type: 'pop', text: '  }', class: 'code-keyword' },
    { type: 'type', text: '};', class: 'code-keyword' },
    { type: 'type', text: 'Success! Profile loaded.', class: 'text-success' }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .text-muted { color: #888; }
    .text-success { color: #4ade80; }
  `;
  document.head.appendChild(style);

  terminalContent.innerHTML = '';
  
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  async function typeLine(container, text, className) {
    const lineSpan = document.createElement('div');
    if (className) lineSpan.className = className;
    container.appendChild(lineSpan);

    for (let i = 0; i < text.length; i++) {
      lineSpan.textContent += text[i];
      await delay(30); // typing speed
    }
  }

  async function popLine(container, text, className) {
    const lineSpan = document.createElement('div');
    if (className) lineSpan.className = className;
    lineSpan.style.opacity = '0';
    lineSpan.style.transform = 'translateY(5px)';
    lineSpan.style.transition = 'opacity 0.3s, transform 0.3s';
    lineSpan.textContent = text;
    container.appendChild(lineSpan);
    
    // trigger reflow
    void lineSpan.offsetWidth;
    
    lineSpan.style.opacity = '1';
    lineSpan.style.transform = 'translateY(0)';
  }

  async function runTerminal() {
    for (const line of lines) {
      if (line.type === 'type') {
        await typeLine(terminalContent, line.text, line.class);
      } else {
        await popLine(terminalContent, line.text, line.class);
      }
      await delay(150); // delay between lines
    }
  }

  // We can start the animation when it scrolls into view using IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      runTerminal();
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(terminalContent);
});
