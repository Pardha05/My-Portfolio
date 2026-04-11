
// ══════════════════════════════════════════
// LENIS SMOOTH SCROLL
// ══════════════════════════════════════════
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ lerp: 0.08, smooth: true });
  window._lenis = lenis;
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

// ══════════════════════════════════════════
// SCROLL STACK ENGINE
// ══════════════════════════════════════════
function initScrollStack() {
  const cards = document.querySelectorAll('.scroll-stack-card');
  if (!cards.length) return;

  function updateProjectStack() {
    const reads = [];
    cards.forEach(card => reads.push(card.getBoundingClientRect().top));
    cards.forEach((card, i) => {
      const brightness = reads[i] <= 90 + i * 12 ? 0.75 + (i / Math.max(cards.length, 1)) * 0.25 : 1;
      card.style.filter = 'brightness(' + brightness + ')';
      card.style.zIndex = i;
    });
  }

  window.addEventListener('scroll', function() { requestAnimationFrame(updateProjectStack); }, { passive: true });
  updateProjectStack();
}

// ══════════════════════════════════════════
// 3-STEP STEPPER
// ══════════════════════════════════════════
var _stepperCurrentStep = 1;

function _stepperShowPanel(panelId, direction) {
  var all = document.querySelectorAll('.step-panel');
  all.forEach(function(p) { p.classList.remove('active', 'slide-back'); });
  var target = document.querySelector('.step-panel[data-panel="' + panelId + '"]');
  if (!target) return;
  if (direction === 'back') target.classList.add('slide-back');
  target.classList.add('active');
}

function _stepperUpdateHeader(step) {
  document.querySelectorAll('.step-indicator').forEach(function(ind) {
    var s = parseInt(ind.dataset.step);
    ind.classList.remove('active', 'completed');
    if (s < step) ind.classList.add('completed');
    else if (s === step) ind.classList.add('active');
  });
  document.querySelectorAll('.step-connector').forEach(function(conn, i) {
    conn.classList.toggle('active', i < step - 1);
  });
}

function stepperNext(currentStep) {
  var inputId = currentStep === 1 ? 'formName' : 'formEmail';
  var input = document.getElementById(inputId);
  if (!input || !input.value.trim()) {
    if (input) { input.style.borderColor = '#ef4444'; }
    return;
  }
  if (currentStep === 2) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(input.value.trim())) {
      input.style.borderColor = '#ef4444';
      return;
    }
  }
  _stepperCurrentStep = currentStep + 1;
  _stepperShowPanel(_stepperCurrentStep, 'forward');
  _stepperUpdateHeader(_stepperCurrentStep);
}

function stepperBack(currentStep) {
  _stepperCurrentStep = currentStep - 1;
  _stepperShowPanel(_stepperCurrentStep, 'back');
  _stepperUpdateHeader(_stepperCurrentStep);
}

function stepperSubmit() {
  var name    = (document.getElementById('formName') ? document.getElementById('formName').value : '').trim();
  var email   = (document.getElementById('formEmail') ? document.getElementById('formEmail').value : '').trim();
  var message = (document.getElementById('formMessage') ? document.getElementById('formMessage').value : '').trim();

  if (!message) {
    var ta = document.getElementById('formMessage');
    if (ta) ta.style.borderColor = '#ef4444';
    return;
  }

  var btn = document.getElementById('stepSubmit');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }

  var fd = new FormData();
  fd.append('name', name);
  fd.append('email', email);
  fd.append('message', message);

  fetch('https://formspree.io/f/meelgyvw', {
    method: 'POST', body: fd, headers: { 'Accept': 'application/json' }
  })
  .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
  .then(function() {
    _stepperShowPanel('success', 'forward');
    _stepperCurrentStep = 1;
    if (typeof showToast !== 'undefined') showToast('Message sent!', 'success');
  })
  .catch(function() {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; }
    if (typeof showToast !== 'undefined') showToast('Failed to send. Please try again.', 'error');
  });
}

function stepperReset() {
  ['formName', 'formEmail', 'formMessage'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  _stepperCurrentStep = 1;
  _stepperShowPanel(1, 'back');
  _stepperUpdateHeader(1);
}
