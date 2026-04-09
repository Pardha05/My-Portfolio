/* ══════════════════════════════════════════
   PORTFOLIO – Main Application JS
   ══════════════════════════════════════════ */

window.siteContent = {};

// ══════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroCanvas();
  initScrollReveal();
  console.log('Portfolio App v9 Loaded');
  // Fetch content from JSON file (Static Site Mode)

  // Fetch content from JSON file (Static Site Mode)
  fetch('data/content.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
      window.siteContent = data;
      renderAllSections();
    })
    .catch(error => console.error('Error loading content:', error));

  initContactForm();
  initContactForm();
  initSmoothScroll();
  initModalEvents();
});

// ══════════════════════════════════════════
// RENDER COMPONENTS
// ══════════════════════════════════════════
function renderAllSections() {
  if (!siteContent) return;

  // Hero
  const nameEl = document.getElementById('heroName');
  if (nameEl && siteContent.hero.name) {
    nameEl.innerHTML = siteContent.hero.name.split('').map((char, index) => {
      const isSpace = char === ' ';
      return `<span class="jump-char">${isSpace ? '&nbsp;' : char}</span>`;
    }).join('');
  }
  setText('heroTitle', siteContent.hero.title);
  setText('heroTagline', siteContent.hero.tagline);

  // Resume Button Logic
  const viewBtn = document.getElementById('viewResumeBtn');
  const dlBtn = document.getElementById('downloadResumeBtn');
  const unavailable = document.getElementById('resumeUnavailable');

  if (siteContent.hero.resumeFile) {
    if (viewBtn) {
      viewBtn.href = siteContent.hero.resumeFile;
      viewBtn.style.display = 'inline-flex';
    }
    if (dlBtn) {
      dlBtn.href = siteContent.hero.resumeFile;
      dlBtn.style.display = 'inline-flex';
    }
    if (unavailable) unavailable.style.display = 'none';
  } else {
    if (viewBtn) viewBtn.style.display = 'none';
    if (dlBtn) dlBtn.style.display = 'none';
    if (unavailable) unavailable.style.display = 'flex';
  }

  // About
  setText('aboutIntro', siteContent.about.intro);
  setText('aboutEducation', siteContent.about.education);
  setText('aboutUniversity', siteContent.about.university);
  setText('aboutYear', siteContent.about.year);
  setText('aboutGoal', siteContent.about.goal);

  // Render Lists
  renderSkills();
  renderProjects();
  renderAchievements();
  renderAchievements();

  // Contact
  setText('contactMessage', siteContent.contact.message);
  updateLink('contactEmail', `mailto:${siteContent.contact.email}`, siteContent.contact.email);
  updateLink('contactLinkedin', siteContent.contact.linkedin);
  updateLink('contactGithub', siteContent.contact.github);

  // Footer
  updateLink('footerGithub', siteContent.contact.github);
  updateLink('footerLinkedin', siteContent.contact.linkedin);
  updateLink('footerEmail', `mailto:${siteContent.contact.email}`);

  // Re-init magic effects and scroll reveal
  if (window.initMagicBento) initMagicBento();
  setTimeout(initScrollReveal, 100);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function updateLink(id, href, text) {
  const el = document.getElementById(id);
  if (el) {
    el.href = href;
    if (text) {
      const span = el.querySelector('span');
      if (span) span.textContent = text;
    }
  }
}

// ══════════════════════════════════════════
// RENDER: PROJECTS (Enhanced)
// ══════════════════════════════════════════
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !siteContent.projects) return;

  const isAdmin = document.body.classList.contains('admin-mode');

  grid.innerHTML = siteContent.projects.map((proj, i) => {
    const statusLabels = { 'completed': 'Completed', 'in-progress': 'In Progress', 'future': 'Future' };
    const statusClass = proj.status || 'completed';
    const statusLabel = statusLabels[statusClass] || 'Completed';

    return `
    <div class="project-card magic-card reveal-zoom" onclick="showProjectDetails(${i})" style="cursor:pointer;">
      ${isAdmin ? `
        <div class="project-admin-actions">
          <button class="edit-item-btn" onclick="event.stopPropagation(); editProject(${i})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="delete-item-btn" onclick="event.stopPropagation(); deleteProject(${i})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      ` : ''}
      <div class="folder-logo-container">
        <svg class="folder-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="folder-body" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <g class="file-doc">
            <rect x="7" y="7" width="10" height="10" rx="1" />
            <line class="doc-line" x1="10" y1="10" x2="14" y2="10" />
            <line class="doc-line" x1="10" y1="13" x2="14" y2="13" />
          </g>
          <path class="folder-body" d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9z" />
        </svg>
      </div>
      <div class="project-title-row">
        <h3 class="project-title">${escapeHtml(proj.title)}</h3>
      </div>
      <div style="margin-bottom: 12px;">
        <span class="project-status-badge status-${statusClass}">${statusLabel}</span>
      </div>
      <p class="project-desc">${escapeHtml(proj.description)}</p>
      <div class="project-tech">
        ${proj.techStack.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="project-links">
        ${proj.liveLink ? (
        proj.liveLink === '#' ?
          `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); showToast('Link Unavailable', 'info')"><i class="fas fa-external-link-alt"></i> Live</button>` :
          `<a href="${escapeHtml(proj.liveLink)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live</a>`
      ) : ''}
        ${proj.githubLink && proj.githubLink !== '#' ? `<a href="${escapeHtml(proj.githubLink)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()"><i class="fab fa-github"></i> GitHub</a>` : ''}
      </div>
    </div>
  `}).join('');
}

function showProjectDetails(index) {
  const proj = siteContent.projects[index];
  if (!proj) return;

  const statusLabels = { 'completed': 'Completed', 'in-progress': 'In Progress', 'future': 'Future' };
  const statusClass = proj.status || 'completed';
  const statusLabel = statusLabels[statusClass] || 'Completed';

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');

  modalTitle.textContent = proj.title;
  modalBody.innerHTML = `
    <div class="project-details-modal">
      <div class="project-detail-status">
        <span class="project-status-badge status-${statusClass}">${statusLabel}</span>
      </div>
      <p class="project-detail-desc">${escapeHtml(proj.description)}</p>
      <div class="project-detail-info">
        <div class="project-detail-row">
          <i class="fas fa-calendar-alt"></i>
          <div>
            <strong>Started</strong>
            <p>${formatDate(proj.startDate)}</p>
          </div>
        </div>
        <div class="project-detail-row">
          <i class="fas fa-flag-checkered"></i>
          <div>
            <strong>${proj.status === 'completed' ? 'Completed' : proj.status === 'in-progress' ? 'Expected Completion' : 'Planned'}</strong>
            <p>${proj.completionDate ? formatDate(proj.completionDate) : (proj.status === 'in-progress' ? 'Ongoing' : '—')}</p>
          </div>
        </div>
      </div>
      <div class="project-detail-section">
        <h4><i class="fas fa-tools"></i> Tech Stack</h4>
        <div class="project-tech" style="margin-top:8px;">
          ${proj.techStack.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div class="project-detail-links">
        ${proj.liveLink ? (
      proj.liveLink === '#' ?
        `<button class="btn btn-primary" onclick="showToast('Link Unavailable', 'info')"><i class="fas fa-external-link-alt"></i> View Live</button>` :
        `<a href="${escapeHtml(proj.liveLink)}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> View Live</a>`
    ) : ''}
        ${proj.githubLink && proj.githubLink !== '#' ? `<a href="${escapeHtml(proj.githubLink)}" target="_blank" class="btn btn-outline"><i class="fab fa-github"></i> GitHub</a>` : ''}
      </div>
    </div>
  `;
  modal.classList.add('active');
}

// ══════════════════════════════════════════
// RENDER: SKILLS
// ══════════════════════════════════════════
function renderSkills() {
  const grid = document.getElementById('skillsGrid');
  if (!grid || !siteContent.skills) return;

  const iconMap = {
    code: 'fas fa-code',
    globe: 'fas fa-globe',
    cpu: 'fas fa-microchip',
    tool: 'fas fa-wrench',
    database: 'fas fa-database',
    cloud: 'fas fa-cloud',
    mobile: 'fas fa-mobile-alt',
    lock: 'fas fa-lock',
    dsa: 'fas fa-sitemap',
    server: 'fas fa-server',
    gym: 'fas fa-dumbbell',
    dumble: 'fas fa-dumbbell',
    Dumble: 'fas fa-dumbbell'
  };

  grid.innerHTML = siteContent.skills.categories.map((cat, index) => `
    <div class="skill-card magic-card ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'}" data-skill-index="${index}">
      <div class="skill-card-header" onclick="toggleSkillCategory(this)">
        <div class="skill-card-header-left">
          <div class="skill-card-icon">
            ${(() => {
              if (cat.name === 'Programming') {
                return `
                  <div class="dev-link skill-icon-animated">
                    <div class="icon-container">
                      <span class="bracket">&lt;</span>
                      <span class="slash">/</span>
                      <span class="bracket">&gt;</span>
                    </div>
                  </div>`;
              } else if (cat.name === 'Web Development') {
                return `
                  <div class="logo-wrapper">
                    <svg class="design-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect class="browser-frame" x="2" y="4" width="20" height="16" rx="2" />
                      <line class="browser-frame" x1="2" y1="8" x2="22" y2="8" />
                      <rect class="box box-top" x="5" y="11" width="7" height="5" rx="1" />
                      <rect class="box box-bottom" x="10" y="14" width="7" height="5" rx="1" />
                      <g class="pen">
                        <path d="M17 7L19 5L21 7L19 9L17 7Z" />
                        <path d="M13 11L17 7" />
                      </g>
                    </svg>
                  </div>`;
              } else if (cat.name === 'Databases') {
                return `
                  <div class="stack-logo-container">
                    <svg class="stack-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path class="connector" d="M17 6v12h-2" />
                      <rect class="node" x="14" y="2" width="6" height="5" rx="1.5" />
                      <rect class="layer layer-1" x="4" y="6" width="10" height="3" rx="1" />
                      <rect class="layer layer-2" x="4" y="11" width="10" height="3" rx="1" />
                      <rect class="layer layer-3" x="4" y="16" width="10" height="3" rx="1" />
                    </svg>
                  </div>`;
              } else if (cat.name === 'Tools') {
                return `
                  <div class="settings-logo-container">
                    <svg class="settings-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path class="cog" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path class="cog" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                      <g class="wrench" stroke="currentColor">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a2.12 2.12 0 00-3-3L14.7 6.3z" />
                        <path d="M14.1 7.2l-9.1 9.1a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l9.1-9.1" />
                        <path d="M3.5 17.5a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a2.12 2.12 0 00-3-3l-3 3z" />
                      </g>
                    </svg>
                  </div>`;
              } else if (cat.name === 'Development Approach') {
                return `
                  <div class="blocks-container">
                    <svg class="blocks-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <g class="block block-b">
                        <path class="face-left" d="M12 22l-4-2.3V15l4 2.3V22z" />
                        <path class="face-right" d="M12 22l4-2.3V15l-4 2.3V22z" />
                        <path class="face-top" d="M12 17.4l-4-2.3 4-2.3 4 2.3-4 2.3z" />
                      </g>
                      <g class="block block-tl">
                        <path class="face-left" d="M8 14.7l-4-2.3V7.7l4 2.3v4.7z" />
                        <path class="face-right" d="M8 14.7l4-2.3V7.7l-4 2.3v4.7z" />
                        <path class="accent-face" d="M8 10l-4-2.3 4-2.3 4 2.3-4 2.3z" />
                      </g>
                      <g class="block block-tr">
                        <path class="face-left" d="M16 14.7l-4-2.3V7.7l4 2.3v4.7z" />
                        <path class="face-right" d="M16 14.7l4-2.3V7.7l-4 2.3v4.7z" />
                        <path class="accent-face" d="M16 10l-4-2.3 4-2.3 4 2.3-4 2.3z" />
                      </g>
                    </svg>
                  </div>`;
              }
              return `<i class="${iconMap[cat.icon] || 'fas fa-code'}"></i>`;
            })()}
          </div>
          <h3 class="skill-card-title">${escapeHtml(cat.name)}</h3>
        </div>
        <div class="skill-card-chevron">
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>
      <div class="skills-collapse">
        <div class="skills-list">
          ${cat.skills.map(skill => {
    const levelClass = skill.level ? skill.level.toLowerCase() : 'intermediate';
    return `
              <div class="skill-item">
                <span class="skill-name">${escapeHtml(skill.name)}</span>
                <span class="skill-level-badge level-${levelClass}">${escapeHtml(skill.level)}</span>
              </div>
            `;
  }).join('')}
        </div>
      </div>
    </div>
  `).join('');

  // Initial animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  grid.querySelectorAll('.skill-card').forEach(card => observer.observe(card));
}

/**
 * Toggle individual skill category expansion
 */
function toggleSkillCategory(header) {
  const card = header.closest('.skill-card');
  const collapse = card.querySelector('.skills-collapse');
  const isActive = card.classList.contains('active');

  // Close other cards for a clean accordion experience
  document.querySelectorAll('.skill-card.active').forEach(otherCard => {
    if (otherCard !== card) {
      otherCard.classList.remove('active');
      otherCard.querySelector('.skills-collapse').style.maxHeight = '0px';
    }
  });

  if (isActive) {
    card.classList.remove('active');
    collapse.style.maxHeight = '0px';
  } else {
    card.classList.add('active');
    collapse.style.maxHeight = collapse.scrollHeight + 'px';
  }
}

// ══════════════════════════════════════════
// RENDER: ACHIEVEMENTS
// ══════════════════════════════════════════
function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid || !siteContent.achievements) return;

  const isAdmin = document.body.classList.contains('admin-mode');

  grid.innerHTML = siteContent.achievements.map((ach, i) => `
    <div class="achievement-card magic-card reveal-zoom">
      ${isAdmin ? `
        <div class="project-admin-actions">
          <button class="edit-item-btn" onclick="editAchievement(${i})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="delete-item-btn" onclick="deleteAchievement(${i})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      ` : ''}
      <div class="cert-logo-container">
        <svg class="cert-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="cert-frame" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          <line class="cert-frame" x1="7" y1="9" x2="13" y2="9" />
          <path class="cert-frame" d="M7 13h2" />
          <g class="badge-group">
            <path d="M15 17l2 2 2-2v4l-2-1-2 1v-4z" stroke="var(--accent)" fill="rgba(99, 102, 241, 0.2)" />
            <circle class="badge-circle" cx="17" cy="14" r="4" />
            <path class="star" d="M17 12.5l.6 1.2 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2.6-1.2z" />
          </g>
        </svg>
      </div>
      <div class="achievement-type">${escapeHtml(ach.type)}</div>
      <h3 class="project-title" style="font-size:1rem; margin-bottom:8px;">${escapeHtml(ach.title)}</h3>
      <p class="project-desc">${escapeHtml(ach.description)}</p>
    </div>
  `).join('');

  const linkedinLink = document.getElementById('moreCertificatesLink');
  if (linkedinLink && siteContent.contact.linkedin) {
    linkedinLink.href = siteContent.contact.linkedin;
  }
}




// ══════════════════════════════════════════
// UTILITIES & INTERACTIONS
// ══════════════════════════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

function initModalEvents() {
  const modal = document.getElementById('editModal');
  const closeBtn = document.getElementById('editModalClose');

  if (modal && closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    // Send to Formspree
    const formData = new FormData();
    formData.append('name', document.getElementById('formName').value);
    formData.append('email', document.getElementById('formEmail').value);
    formData.append('message', document.getElementById('formMessage').value);

    console.log('Sending message to Formspree...');

    fetch('https://formspree.io/f/meelgyvw', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        console.log('Formspree response status:', response.status);
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(data => {
            if (Object.hasOwn(data, 'errors')) {
              throw new Error(data.errors.map(error => error.message).join(", "));
            } else {
              throw new Error('Form submission failed');
            }
          });
        }
      })
      .then(data => {
        console.log('Formspree success:', data);
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        btn.classList.add('btn-success');
        form.reset();
        showToast('Message sent successfully!', 'success');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.classList.remove('btn-success');
        }, 3000);
      })
      .catch(error => {
        console.error('Formspree Error:', error);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
        btn.classList.add('btn-danger');
        showToast('Error: ' + error.message, 'error');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.classList.remove('btn-danger');
        }, 3000);
      });
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-rotate').forEach(el => observer.observe(el));
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════════════
// VISUALS (Particles)
// ══════════════════════════════════════════
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor(window.innerWidth / 10);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2,
        opacity: Math.random() * 0.5
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(107, 138, 173, 0.5)';

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  resize();
  createParticles();
  drawParticles();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}

// ══════════════════════════════════════════
// EXPOSE FUNCTIONS FOR ADMIN
// ══════════════════════════════════════════
window.renderAllSections = renderAllSections;
window.renderProjects = renderProjects;
window.renderAchievements = renderAchievements;
window.renderSkills = renderSkills;

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '4px';
  toast.style.color = '#fff';
  toast.style.fontWeight = '500';
  toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  toast.style.zIndex = '10000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';

  if (type === 'success') toast.style.backgroundColor = '#2ecc71';
  else if (type === 'error') toast.style.backgroundColor = '#e74c3c';
  else toast.style.backgroundColor = '#3498db';

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}