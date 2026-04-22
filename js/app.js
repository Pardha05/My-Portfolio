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
  initLenis();
  initDraggablePill();
  initIntroAnimation();
  console.log('Portfolio App v10 Loaded');

  fetch('data/content.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
      window.siteContent = data;
      renderAllSections();
      setTimeout(initScrollStack, 200);
    })
    .catch(error => console.error('Error loading content:', error));

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
// RENDER: PROJECTS — Scroll Stack Cards
// ══════════════════════════════════════════
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !siteContent.projects) return;

  const isAdmin = document.body.classList.contains('admin-mode');

  grid.innerHTML = siteContent.projects.map((proj, i) => {
    const statusLabels = { 'completed': 'Completed', 'in-progress': 'In Progress', 'future': 'Future' };
    const statusClass = proj.status || 'completed';
    const statusLabel = statusLabels[statusClass] || 'Completed';

    const liveBtn = proj.liveLink && proj.liveLink !== '#'
      ? `<a href="${escapeHtml(proj.liveLink)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live</a>`
      : (proj.liveLink === '#' ? `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showToast('Coming soon','info')"><i class="fas fa-external-link-alt"></i> Live</button>` : '');

    const ghBtn = proj.githubLink && proj.githubLink !== '#'
      ? `<a href="${escapeHtml(proj.githubLink)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">
          <div class="github-icon" style="width:1em;height:1em;margin-right:5px;vertical-align:middle;">
            <svg viewBox="0 0 98 96"><path class="github-octo-fill" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>
          </div>GitHub</a>`
      : '';

    const adminBtns = isAdmin
      ? `<div class="project-admin-actions">
          <button class="edit-item-btn" onclick="event.stopPropagation();editProject(${i})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="delete-item-btn" onclick="event.stopPropagation();deleteProject(${i})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>` : '';

    return `
    <div class="scroll-stack-card" onclick="showProjectDetails(${i})">
      ${adminBtns}
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:0.75rem;flex-wrap:wrap;">
            <span class="project-status-badge status-${statusClass}" style="font-size:0.72rem;">${statusLabel}</span>
            ${(proj.techStack || []).slice(0,4).map(t => `<span class="tech-tag" style="opacity:0.8;">${escapeHtml(t)}</span>`).join('')}
          </div>
          <h3 class="project-title" style="font-size:1.5rem;margin-bottom:0.6rem;">${escapeHtml(proj.title)}</h3>
          <p class="project-desc" style="margin-bottom:1rem;line-height:1.6;">${escapeHtml(proj.description)}</p>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">${liveBtn}${ghBtn}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  setTimeout(initScrollStack, 100);
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
        ${proj.githubLink && proj.githubLink !== '#' ? `<a href="${escapeHtml(proj.githubLink)}" target="_blank" class="btn btn-outline">
          <div class="github-icon" style="width: 1em; height: 1em; margin-right: 5px; vertical-align: middle;">
            <svg viewBox="0 0 100 100"><path class="body-outline" d="M50,20 c-15,0 -25,10 -25,25 c0,10 5,18 12,22 v10 h26 v-10 c7,-4 12,-12 12,-22 c0,-15 -10,-25 -25,-25 Z M35,22 c-2,-5 -8,-5 -8,-5 s0,6 2,8 M65,22 c2,-5 8,-5 8,-5 s0,6 -2,8" /><path class="tail" d="M37,77 c-10,0 -15,-5 -20,-2" /></svg>
          </div>GitHub</a>` : ''}
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
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  // ── Scroll shadow ──
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // ── Mobile hamburger ──
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

  // ── Theme toggle (Custom Switch) ──
  const themeToggle = document.getElementById('themeToggleCheckbox');

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (themeToggle) {
    themeToggle.checked = (savedTheme === 'light');
  }
  applyTheme(savedTheme);

  themeToggle && themeToggle.addEventListener('change', () => {
    const next = themeToggle.checked ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  function applyTheme(theme) {
    const profileImg = document.getElementById('heroProfileImg');
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      if (profileImg) profileImg.src = 'assets/profile-light.png';
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (profileImg) profileImg.src = 'assets/profile.png';
    }
  }
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
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-rotate');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════════════
// INTRO ANIMATION
// ══════════════════════════════════════════
function initIntroAnimation() {
  const intro = document.getElementById('intro-animation');
  const marqueeSpan = document.getElementById('marquee-text');
  if (!intro) return;

  try {
    if (marqueeSpan) {
      const words = '<span class="logo-bracket">&lt;</span>Portfolio <span class="logo-bracket">/&gt;</span>  •  ';
      marqueeSpan.innerHTML = words.repeat(40);
    }
  } catch (e) {
    console.error('Marquee sync error:', e);
  }

  // Prevent scrolling during animation
  document.body.style.overflow = 'hidden';

  // Force reveal after 3 seconds no matter what
  const finish = () => {
    intro.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Re-trigger scroll reveal for hero elements after splash fades
    setTimeout(() => {
      const heroReveal = document.querySelectorAll('#hero .reveal-up, #hero .reveal-zoom, .reveal-up, .reveal-zoom');
      heroReveal.forEach(el => el.classList.add('revealed'));
    }, 500);
  };

  setTimeout(finish, 2500);
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

function initDraggablePill() {
  const pill = document.querySelector('.social-pill-nav');
  if (!pill) return;

  let isDragging = false;
  let startX, startY;
  let hasMoved = false;

  // Load saved position
  const savedPos = localStorage.getItem('pillPosition');
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      applyPosition(pos.x, pos.y);
    } catch(e) { console.error('Pill pos error', e); }
  }

  pill.addEventListener('mousedown', startDrag);
  pill.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    isDragging = true;
    hasMoved = false;
    pill.classList.add('dragging');

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    const rect = pill.getBoundingClientRect();
    startX = clientX - rect.left;
    startY = clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Lock background scroll (Native + Lenis)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    if (window._lenis) window._lenis.stop();
  }

  function drag(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    // Small threshold to distinguish drag from click
    const rectNow = pill.getBoundingClientRect();
    if (Math.abs(clientX - (rectNow.left + startX)) > 5 || Math.abs(clientY - (rectNow.top + startY)) > 5) {
      hasMoved = true;
    }

    let x = clientX - startX;
    let y = clientY - startY;

    // Viewport Boundaries
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pWidth = pill.offsetWidth;
    const pHeight = pill.offsetHeight;

    x = Math.max(0, Math.min(x, w - pWidth));
    y = Math.max(0, Math.min(y, h - pHeight));

    applyPosition(x, y);
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    pill.classList.remove('dragging');

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);

    // Restore background scroll (Native + Lenis)
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    if (window._lenis) window._lenis.start();

    // Save position
    const rect = pill.getBoundingClientRect();
    localStorage.setItem('pillPosition', JSON.stringify({ x: rect.left, y: rect.top }));
  }

  function applyPosition(x, y) {
    pill.style.left = x + 'px';
    pill.style.top = y + 'px';
    pill.style.bottom = 'auto';
    pill.style.right = 'auto';
    pill.style.transform = 'none';
  }

  // Prevent following links IF we were dragging
  pill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
  });
}