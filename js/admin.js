/* ══════════════════════════════════════════
   PORTFOLIO – Admin Module
   ══════════════════════════════════════════ */

// ── DOM References ──
const adminBtn = document.getElementById('adminBtn');
const loginModal = document.getElementById('loginModal');
const loginModalClose = document.getElementById('loginModalClose');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const adminToolbar = document.getElementById('adminToolbar');
const logoutBtn = document.getElementById('logoutBtn');
const editModal = document.getElementById('editModal');
const editModalClose = document.getElementById('editModalClose');
const editModalTitle = document.getElementById('editModalTitle');
const editModalBody = document.getElementById('editModalBody');

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  //   checkAuthStatus();
  initAdminEvents();
  initResumeUpload();
});


// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth-status');
    const data = await res.json();
    if (data.isAdmin) {
      enableAdminMode();
    }
  } catch (err) {
    // Not logged in
  }
}

function initAdminEvents() {
  // Open login modal
  adminBtn.addEventListener('click', () => {
    if (document.body.classList.contains('admin-mode')) {
      // Already admin, open dashboard-like view
      showToast('You are already logged in. Use edit buttons on each section.', 'success');
    } else {
      loginModal.classList.add('active');
    }
  });

  // Close login modal
  loginModalClose.addEventListener('click', () => loginModal.classList.remove('active'));
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('active');
  });

  // Login form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        loginModal.classList.remove('active');
        loginForm.reset();
        enableAdminMode();
        showToast('Logged in successfully!', 'success');
      } else {
        loginError.textContent = data.error || 'Invalid credentials';
      }
    } catch (err) {
      loginError.textContent = 'Login failed. Please try again.';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      disableAdminMode();
      showToast('Logged out', 'success');
    } catch (err) {
      console.error('Logout error:', err);
    }
  });

  // Close edit modal
  editModalClose.addEventListener('click', () => editModal.classList.remove('active'));
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.classList.remove('active');
  });
}


// ══════════════════════════════════════════
// ADMIN MODE
// ══════════════════════════════════════════
function enableAdminMode() {
  document.body.classList.add('admin-mode');
  adminToolbar.style.display = 'flex';
  adminBtn.innerHTML = '<i class="fas fa-unlock"></i> Admin';

  // Add edit buttons to sections
  addSectionEditButtons();

  // Re-render projects and achievements with admin controls
  if (window.siteContent) {
    window.renderProjects();
    window.renderAchievements();
  }

  // Show add buttons
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');

  // Bind add buttons
  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) addProjectBtn.onclick = addProject;

  const addAchievementBtn = document.getElementById('addAchievementBtn');
  if (addAchievementBtn) addAchievementBtn.onclick = addAchievement;
}

function disableAdminMode() {
  document.body.classList.remove('admin-mode');
  adminToolbar.style.display = 'none';
  adminBtn.innerHTML = '<i class="fas fa-lock"></i> Admin';

  // Remove edit buttons
  document.querySelectorAll('.section-edit-btn').forEach(btn => btn.remove());
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');

  // Re-render without admin controls
  if (window.siteContent) {
    window.renderProjects();
    window.renderAchievements();
  }
}

function addSectionEditButtons() {
  const sections = [
    { id: 'about', label: 'Edit About', handler: editAbout },
    { id: 'skills', label: 'Edit Skills', handler: editSkills },
    { id: 'hobbies', label: 'Edit Hobbies', handler: editHobbies },
    { id: 'contact', label: 'Edit Contact', handler: editContact },
  ];

  // Also add hero edit
  const heroSection = document.getElementById('hero');
  if (heroSection && !heroSection.querySelector('.section-edit-btn')) {
    const btn = createEditBtn('Edit Hero', editHero);
    btn.style.top = '80px';
    heroSection.appendChild(btn);
  }

  sections.forEach(({ id, label, handler }) => {
    const section = document.getElementById(id);
    if (section && !section.querySelector('.section-edit-btn')) {
      section.appendChild(createEditBtn(label, handler));
    }
  });
}

function createEditBtn(label, handler) {
  const btn = document.createElement('button');
  btn.className = 'section-edit-btn';
  btn.innerHTML = `<i class="fas fa-pen"></i> ${label}`;
  btn.addEventListener('click', handler);
  return btn;
}


// ══════════════════════════════════════════
// EDIT: HERO
// ══════════════════════════════════════════
function editHero() {
  openEditModal('Edit Hero Section', `
    <div class="edit-form-group">
      <label>Name</label>
      <input type="text" id="editHeroName" value="${escapeAttr(window.siteContent.hero.name)}">
    </div>
    <div class="edit-form-group">
      <label>Title</label>
      <input type="text" id="editHeroTitle" value="${escapeAttr(window.siteContent.hero.title)}">
    </div>
    <div class="edit-form-group">
      <label>Tagline</label>
      <textarea id="editHeroTagline">${escapeHtml(window.siteContent.hero.tagline)}</textarea>
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveHero()">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveHero() {
  window.siteContent.hero.name = document.getElementById('editHeroName').value;
  window.siteContent.hero.title = document.getElementById('editHeroTitle').value;
  window.siteContent.hero.tagline = document.getElementById('editHeroTagline').value;
  await saveContent();
  window.renderAllSections();
  closeEditModal();
}


// ══════════════════════════════════════════
// EDIT: ABOUT
// ══════════════════════════════════════════
function editAbout() {
  openEditModal('Edit About Section', `
    <div class="edit-form-group">
      <label>Introduction</label>
      <textarea id="editAboutIntro" rows="4">${escapeHtml(window.siteContent.about.intro)}</textarea>
    </div>
    <div class="edit-form-group">
      <label>Education</label>
      <input type="text" id="editAboutEdu" value="${escapeAttr(window.siteContent.about.education)}">
    </div>
    <div class="edit-form-group">
      <label>University</label>
      <input type="text" id="editAboutUni" value="${escapeAttr(window.siteContent.about.university)}">
    </div>
    <div class="edit-form-group">
      <label>Year</label>
      <input type="text" id="editAboutYear" value="${escapeAttr(window.siteContent.about.year)}">
    </div>
    <div class="edit-form-group">
      <label>Career Goal</label>
      <textarea id="editAboutGoal" rows="3">${escapeHtml(window.siteContent.about.goal)}</textarea>
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveAbout()">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveAbout() {
  window.siteContent.about.intro = document.getElementById('editAboutIntro').value;
  window.siteContent.about.education = document.getElementById('editAboutEdu').value;
  window.siteContent.about.university = document.getElementById('editAboutUni').value;
  window.siteContent.about.year = document.getElementById('editAboutYear').value;
  window.siteContent.about.goal = document.getElementById('editAboutGoal').value;
  await saveContent();
  window.renderAllSections();
  closeEditModal();
}


// ══════════════════════════════════════════
// EDIT: SKILLS
// ══════════════════════════════════════════
function editSkills() {
  const inputStyle = 'padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);';
  const deleteStyle = 'background:rgba(107,58,58,0.2); border:none; color:#c08080; width:28px; height:28px; border-radius:4px; cursor:pointer; font-size:14px;';

  let html = '<div id="skillsEditContainer">';
  window.siteContent.skills.categories.forEach((cat, ci) => {
    html += `
      <div class="skill-cat-block" data-cat="${ci}">
        <div style="display:flex; align-items:center; gap:8px; margin:16px 0 8px;">
          <h4 style="margin:0; color:var(--accent); flex:1;">${escapeHtml(cat.name)}</h4>
          <input type="text" class="skill-cat-name" value="${escapeAttr(cat.name)}" placeholder="Category Name" style="${inputStyle} width:180px; font-size:0.85rem; display:none;">
          <input type="text" class="skill-cat-icon" value="${escapeAttr(cat.icon)}" placeholder="Icon" style="${inputStyle} width:80px; font-size:0.8rem; display:none;">
        </div>
        <div class="skill-rows">`;
    cat.skills.forEach((skill, si) => {
      html += `
          <div style="display:flex; gap:8px; margin-bottom:6px; align-items:center;" class="skill-row">
            <input type="text" class="skill-edit-name" value="${escapeAttr(skill.name)}" placeholder="Skill name" style="flex:1; ${inputStyle}">
            <input type="number" class="skill-edit-level" value="${skill.level}" min="0" max="100" style="width:65px; ${inputStyle} text-align:center;">
            <button onclick="this.parentElement.remove()" style="${deleteStyle}" title="Remove skill">✕</button>
          </div>`;
    });
    html += `
        </div>
        <button class="btn btn-outline btn-sm" onclick="addSkillRow(this)" style="margin:4px 0 12px; font-size:0.8rem;"><i class="fas fa-plus"></i> Add Skill</button>
      </div>`;
  });
  html += '</div>';
  html += `
    <button class="btn btn-outline btn-sm" onclick="addCategoryBlock()" style="margin-top:12px;"><i class="fas fa-plus"></i> Add Category</button>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveSkills()">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `;
  openEditModal('Edit Skills', html);
}

function addSkillRow(btn) {
  const inputStyle = 'padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);';
  const deleteStyle = 'background:rgba(107,58,58,0.2); border:none; color:#c08080; width:28px; height:28px; border-radius:4px; cursor:pointer; font-size:14px;';
  const row = document.createElement('div');
  row.className = 'skill-row';
  row.style.cssText = 'display:flex; gap:8px; margin-bottom:6px; align-items:center;';
  row.innerHTML = `
    <input type="text" class="skill-edit-name" value="" placeholder="Skill name" style="flex:1; ${inputStyle}">
    <input type="number" class="skill-edit-level" value="0" min="0" max="100" style="width:65px; ${inputStyle} text-align:center;">
    <button onclick="this.parentElement.remove()" style="${deleteStyle}" title="Remove skill">✕</button>
  `;
  btn.previousElementSibling.appendChild(row);
}

function addCategoryBlock() {
  const inputStyle = 'padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);';
  const container = document.getElementById('skillsEditContainer');
  const block = document.createElement('div');
  block.className = 'skill-cat-block';
  block.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin:16px 0 8px;">
      <input type="text" class="skill-cat-name" value="" placeholder="Category Name" style="${inputStyle} flex:1;">
      <input type="text" class="skill-cat-icon" value="code" placeholder="Icon key" style="${inputStyle} width:80px; font-size:0.8rem;">
    </div>
    <div class="skill-rows"></div>
    <button class="btn btn-outline btn-sm" onclick="addSkillRow(this)" style="margin:4px 0 12px; font-size:0.8rem;"><i class="fas fa-plus"></i> Add Skill</button>
  `;
  container.appendChild(block);
  // Add a first empty skill row automatically
  addSkillRow(block.querySelector('.btn'));
}

async function saveSkills() {
  const categories = [];
  document.querySelectorAll('.skill-cat-block').forEach(block => {
    const catNameInput = block.querySelector('.skill-cat-name');
    const catIconInput = block.querySelector('.skill-cat-icon');
    const header = block.querySelector('h4');

    const catName = catNameInput ? catNameInput.value.trim() || (header ? header.textContent.trim() : 'Unnamed') : 'Unnamed';
    const catIcon = catIconInput ? catIconInput.value.trim() || 'code' : 'code';

    const skills = [];
    block.querySelectorAll('.skill-row').forEach(row => {
      const nameInput = row.querySelector('.skill-edit-name');
      const levelInput = row.querySelector('.skill-edit-level');
      const name = nameInput ? nameInput.value.trim() : '';
      const level = levelInput ? parseInt(levelInput.value) || 0 : 0;
      if (name) skills.push({ name, level });
    });

    if (catName && skills.length > 0) {
      categories.push({ name: catName, icon: catIcon, skills });
    }
  });

  window.siteContent.skills.categories = categories;
  await saveContent();
  window.renderAllSections();
  closeEditModal();
}


// ══════════════════════════════════════════
// EDIT: PROJECTS
// ══════════════════════════════════════════
function editProject(index) {
  const proj = window.siteContent.projects[index];
  const status = proj.status || 'completed';
  openEditModal('Edit Project', `
    <div class="edit-form-group">
      <label>Title</label>
      <input type="text" id="editProjTitle" value="${escapeAttr(proj.title)}">
    </div>
    <div class="edit-form-group">
      <label>Description</label>
      <textarea id="editProjDesc" rows="3">${escapeHtml(proj.description)}</textarea>
    </div>
    <div class="edit-form-group">
      <label>Tech Stack (comma-separated)</label>
      <input type="text" id="editProjTech" value="${escapeAttr(proj.techStack.join(', '))}">
    </div>
    <div class="edit-form-group">
      <label>Live Link</label>
      <input type="text" id="editProjLive" value="${escapeAttr(proj.liveLink)}">
    </div>
    <div class="edit-form-group">
      <label>GitHub Link</label>
      <input type="text" id="editProjGithub" value="${escapeAttr(proj.githubLink)}">
    </div>
    <div class="edit-form-group">
      <div style="display:flex; gap:16px;">
        <div style="flex:1;">
          <label>Start Date</label>
          <input type="date" id="editProjStart" value="${proj.startDate || ''}" style="width:100%; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);">
        </div>
        <div style="flex:1;">
          <label>Completion Date</label>
          <input type="date" id="editProjEnd" value="${proj.completionDate || ''}" style="width:100%; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);">
        </div>
      </div>
    </div>
    <div class="edit-form-group">
      <label>Status</label>
      <select id="editProjStatus" style="padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans); width:100%;">
        <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="future" ${status === 'future' ? 'selected' : ''}>Future</option>
      </select>
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveProject(${index})">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveProject(index) {
  const btn = document.querySelector('.edit-modal-actions .btn-primary');
  const originalText = btn.textContent;
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    if (!window.siteContent || !window.siteContent.projects) {
      throw new Error("Site content not loaded");
    }
    window.siteContent.projects[index].title = document.getElementById('editProjTitle').value;
    window.siteContent.projects[index].description = document.getElementById('editProjDesc').value;
    window.siteContent.projects[index].techStack = document.getElementById('editProjTech').value.split(',').map(s => s.trim()).filter(Boolean);
    window.siteContent.projects[index].liveLink = document.getElementById('editProjLive').value;
    window.siteContent.projects[index].githubLink = document.getElementById('editProjGithub').value;
    window.siteContent.projects[index].startDate = document.getElementById('editProjStart').value;
    window.siteContent.projects[index].completionDate = document.getElementById('editProjEnd').value;
    window.siteContent.projects[index].status = document.getElementById('editProjStatus').value;

    await saveContent();
    window.renderProjects();
    closeEditModal();
  } catch (err) {
    console.error('Save Project Error:', err);
    btn.textContent = originalText;
    btn.disabled = false;
    alert('Error saving project: ' + err.message);
  }
}

function addProject() {
  openEditModal('Add Project', `
    <div class="edit-form-group">
      <label>Title</label>
      <input type="text" id="editProjTitle" value="">
    </div>
    <div class="edit-form-group">
      <label>Description</label>
      <textarea id="editProjDesc" rows="3"></textarea>
    </div>
    <div class="edit-form-group">
      <label>Tech Stack (comma-separated)</label>
      <input type="text" id="editProjTech" value="">
    </div>
    <div class="edit-form-group">
      <label>Live Link</label>
      <input type="text" id="editProjLive" value="">
    </div>
    <div class="edit-form-group">
      <label>GitHub Link</label>
      <input type="text" id="editProjGithub" value="">
    </div>
    <div class="edit-form-group">
      <div style="display:flex; gap:16px;">
        <div style="flex:1;">
          <label>Start Date</label>
          <input type="date" id="editProjStart" value="" style="width:100%; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);">
        </div>
        <div style="flex:1;">
          <label>Completion Date</label>
          <input type="date" id="editProjEnd" value="" style="width:100%; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);">
        </div>
      </div>
    </div>
    <div class="edit-form-group">
      <label>Status</label>
      <select id="editProjStatus" style="padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans); width:100%;">
        <option value="completed">Completed</option>
        <option value="in-progress" selected>In Progress</option>
        <option value="future">Future</option>
      </select>
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveNewProject()">Add</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveNewProject() {
  const newProj = {
    id: 'proj-' + Date.now(),
    title: document.getElementById('editProjTitle').value,
    description: document.getElementById('editProjDesc').value,
    techStack: document.getElementById('editProjTech').value.split(',').map(s => s.trim()).filter(Boolean),
    liveLink: document.getElementById('editProjLive').value,
    githubLink: document.getElementById('editProjGithub').value,
    startDate: document.getElementById('editProjStart').value,
    completionDate: document.getElementById('editProjEnd').value,
    status: document.getElementById('editProjStatus').value
  };
  window.siteContent.projects.push(newProj);
  await saveContent();
  window.renderProjects();
  closeEditModal();
  showToast('Project added!', 'success');
}

async function deleteProject(index) {
  if (confirm('Delete this project?')) {
    window.siteContent.projects.splice(index, 1);
    await saveContent();
    window.renderProjects();
    showToast('Project deleted', 'success');
  }
}


// ══════════════════════════════════════════
// EDIT: ACHIEVEMENTS
// ══════════════════════════════════════════
function editAchievement(index) {
  const ach = window.siteContent.achievements[index];
  openEditModal('Edit Achievement', `
    <div class="edit-form-group">
      <label>Title</label>
      <input type="text" id="editAchTitle" value="${escapeAttr(ach.title)}">
    </div>
    <div class="edit-form-group">
      <label>Description</label>
      <textarea id="editAchDesc" rows="3">${escapeHtml(ach.description)}</textarea>
    </div>
    <div class="edit-form-group">
      <label>Type (certification / workshop / competition)</label>
      <input type="text" id="editAchType" value="${escapeAttr(ach.type)}">
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveAchievement(${index})">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveAchievement(index) {
  window.siteContent.achievements[index].title = document.getElementById('editAchTitle').value;
  window.siteContent.achievements[index].description = document.getElementById('editAchDesc').value;
  window.siteContent.achievements[index].type = document.getElementById('editAchType').value;
  await saveContent();
  window.renderAchievements();
  closeEditModal();
}

function addAchievement() {
  openEditModal('Add Achievement', `
    <div class="edit-form-group">
      <label>Title</label>
      <input type="text" id="editAchTitle" value="">
    </div>
    <div class="edit-form-group">
      <label>Description</label>
      <textarea id="editAchDesc" rows="3"></textarea>
    </div>
    <div class="edit-form-group">
      <label>Type (certification / workshop / competition)</label>
      <input type="text" id="editAchType" value="certification">
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveNewAchievement()">Add</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveNewAchievement() {
  const newAch = {
    id: 'ach-' + Date.now(),
    title: document.getElementById('editAchTitle').value,
    description: document.getElementById('editAchDesc').value,
    type: document.getElementById('editAchType').value
  };
  window.siteContent.achievements.push(newAch);
  await saveContent();
  window.renderAchievements();
  closeEditModal();
  showToast('Achievement added!', 'success');
}

async function deleteAchievement(index) {
  if (confirm('Delete this achievement?')) {
    window.siteContent.achievements.splice(index, 1);
    await saveContent();
    window.renderAchievements();
    showToast('Achievement deleted', 'success');
  }
}


// ══════════════════════════════════════════
// EDIT: HOBBIES
// ══════════════════════════════════════════
function editHobbies() {
  let html = '<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">Edit hobbies below. Available icons: terminal, book-open, gamepad, music, camera, zap, running, paint, plane, film, car, dumble</p>';
  window.siteContent.hobbies.forEach((hobby, i) => {
    html += `
      <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
        <input type="text" class="hobby-edit-name" data-idx="${i}" value="${escapeAttr(hobby.name)}" 
               placeholder="Name" style="flex:1; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);">
        <input type="text" class="hobby-edit-icon" data-idx="${i}" value="${escapeAttr(hobby.icon)}" 
               placeholder="Icon" style="width:120px; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-mono); font-size:0.8rem;">
        <button onclick="this.parentElement.remove()" style="background:rgba(107,58,58,0.2); border:none; color:#c08080; width:32px; height:32px; border-radius:4px; cursor:pointer;">✕</button>
      </div>
    `;
  });
  html += `
    <button class="btn btn-outline btn-sm" onclick="addHobbyRow()" style="margin-top:8px;"><i class="fas fa-plus"></i> Add Hobby</button>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveHobbies()">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `;
  openEditModal('Edit Hobbies', html);
}

function addHobbyRow() {
  const container = editModalBody.querySelector('.edit-modal-actions');
  const row = document.createElement('div');
  row.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
  row.innerHTML = `
    <input type="text" class="hobby-edit-name" value="" placeholder="Name" style="flex:1; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-sans);">
    <input type="text" class="hobby-edit-icon" value="star" placeholder="Icon" style="width:120px; padding:8px; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; color:var(--text-primary); font-family:var(--font-mono); font-size:0.8rem;">
    <button onclick="this.parentElement.remove()" style="background:rgba(107,58,58,0.2); border:none; color:#c08080; width:32px; height:32px; border-radius:4px; cursor:pointer;">✕</button>
  `;
  container.parentElement.insertBefore(row, container.previousElementSibling);
}

async function saveHobbies() {
  const names = editModalBody.querySelectorAll('.hobby-edit-name');
  const icons = editModalBody.querySelectorAll('.hobby-edit-icon');
  const hobbies = [];
  names.forEach((nameInput, i) => {
    const name = nameInput.value.trim();
    const icon = icons[i] ? icons[i].value.trim() : 'star';
    if (name) hobbies.push({ name, icon });
  });
  window.siteContent.hobbies = hobbies;
  await saveContent();
  window.renderHobbies();
  closeEditModal();
}


// ══════════════════════════════════════════
// EDIT: CONTACT
// ══════════════════════════════════════════
function editContact() {
  openEditModal('Edit Contact Info', `
    <div class="edit-form-group">
      <label>Email</label>
      <input type="email" id="editContactEmail" value="${escapeAttr(window.siteContent.contact.email)}">
    </div>
    <div class="edit-form-group">
      <label>LinkedIn URL</label>
      <input type="url" id="editContactLinkedin" value="${escapeAttr(window.siteContent.contact.linkedin)}">
    </div>
    <div class="edit-form-group">
      <label>GitHub URL</label>
      <input type="url" id="editContactGithub" value="${escapeAttr(window.siteContent.contact.github)}">
    </div>
    <div class="edit-form-group">
      <label>Contact Message</label>
      <textarea id="editContactMsg" rows="3">${escapeHtml(window.siteContent.contact.message)}</textarea>
    </div>
    <div class="edit-modal-actions">
      <button class="btn btn-primary" onclick="saveContact()">Save</button>
      <button class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
    </div>
  `);
}

async function saveContact() {
  window.siteContent.contact.email = document.getElementById('editContactEmail').value;
  window.siteContent.contact.linkedin = document.getElementById('editContactLinkedin').value;
  window.siteContent.contact.github = document.getElementById('editContactGithub').value;
  window.siteContent.contact.message = document.getElementById('editContactMsg').value;
  await saveContent();
  window.renderAllSections();
  closeEditModal();
}


// ══════════════════════════════════════════
// RESUME UPLOAD
// ══════════════════════════════════════════
function initResumeUpload() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('resumeFileInput');
  if (!uploadZone || !fileInput) return;

  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) uploadResume(file);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) uploadResume(fileInput.files[0]);
  });
}

async function uploadResume(file) {
  if (file.type !== 'application/pdf') {
    showToast('Only PDF files are allowed', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const res = await fetch('/api/upload-resume', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      showToast('Resume uploaded successfully!', 'success');
      const dlBtn = document.getElementById('downloadResumeBtn');
      if (dlBtn) dlBtn.href = data.path;
    } else {
      showToast('Upload failed: ' + (data.error || 'Unknown error'), 'error');
    }
  } catch (err) {
    showToast('Upload failed. Please try again.', 'error');
  }
}


// ══════════════════════════════════════════
// SHARED HELPERS
// ══════════════════════════════════════════
async function saveContent() {
  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(window.siteContent)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Changes saved!', 'success');
    } else {
      showToast('Failed to save: ' + (data.error || ''), 'error');
    }
  } catch (err) {
    showToast('Failed to save changes', 'error');
  }
}

function openEditModal(title, bodyHtml) {
  editModalTitle.textContent = title;
  editModalBody.innerHTML = bodyHtml;
  editModal.classList.add('active');
}

function closeEditModal() {
  editModal.classList.remove('active');
}

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

  // Colors based on type
  if (type === 'success') toast.style.backgroundColor = '#2ecc71';
  else if (type === 'error') toast.style.backgroundColor = '#e74c3c';
  else toast.style.backgroundColor = '#3498db';

  document.body.appendChild(toast);

  // Trigger fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
