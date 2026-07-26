/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
   ══════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    touchMultiplier: 1,
    infinite: false,
    wheelMultiplier: 1,
    lerp: 0.1,
    smoothTouch: false
  });
  window._lenis = lenis;
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* ══════════════════════════════════════════
   SCROLL STACK ENGINE
   ══════════════════════════════════════════
   Simple approach: Lenis already smooths
   scrollY, so we just read it every frame
   and apply transforms directly. No extra
   lerp or event listeners needed.
   ══════════════════════════════════════════ */
var _ssCards = [];
var _ssBaseOffsets = [];
var _ssEndOffset = 0;
var _ssLastY = [];
var _ssLastS = [];
var _ssActive = false;
var _ssResizeTimer = null;

function _ssPct(value, h) {
  if (typeof value === 'string' && value.indexOf('%') !== -1)
    return (parseFloat(value) / 100) * h;
  return parseFloat(value);
}

function _ssOffset(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

function _ssUpdate() {
  var scrollTop = window.scrollY;
  var vh = window.innerHeight;
  var mob = window.innerWidth <= 768;
  var stackDist = mob ? 15 : 30;
  var stackPos = _ssPct(mob ? '10%' : '20%', vh);
  var scaleEnd = _ssPct(mob ? '5%' : '10%', vh);

  // Find the currently active (front-most) card
  var activeIndex = 0;
  for (var i = 0; i < _ssCards.length; i++) {
    var pinStart = _ssBaseOffsets[i] - stackPos - stackDist * i;
    // We add a tiny buffer (10px) so it becomes active just as it reaches the stack
    if (scrollTop >= pinStart - 10) {
      activeIndex = i;
    }
  }

  for (var i = 0; i < _ssCards.length; i++) {
    var base = _ssBaseOffsets[i];
    var pinStart = base - stackPos - stackDist * i;
    var pinEnd = _ssEndOffset - vh / 2;
    var trigEnd = base - scaleEnd;

    // Pointer events: disable for cards stacked behind the active one
    // This prevents accidental clicks on the top edges of old cards
    var isBackground = (i < activeIndex);
    _ssCards[i].style.pointerEvents = isBackground ? 'none' : 'auto';

    // Scale
    var sp = 0;
    if (trigEnd > pinStart) {
      if (scrollTop < pinStart) sp = 0;
      else if (scrollTop > trigEnd) sp = 1;
      else sp = (scrollTop - pinStart) / (trigEnd - pinStart);
    }
    var tgtS = 0.85 + i * 0.03;
    var s = 1 - sp * (1 - tgtS);

    // TranslateY
    var y = 0;
    if (scrollTop >= pinStart && scrollTop <= pinEnd) {
      y = scrollTop - base + stackPos + stackDist * i;
    } else if (scrollTop > pinEnd) {
      y = pinEnd - base + stackPos + stackDist * i;
    }

    // Round
    y = Math.round(y * 10) / 10;
    s = Math.round(s * 1000) / 1000;

    // Write only if changed
    if (y !== _ssLastY[i] || s !== _ssLastS[i]) {
      _ssCards[i].style.transform = 'translate3d(0,' + y + 'px,0) scale(' + s + ')';
      _ssLastY[i] = y;
      _ssLastS[i] = s;
    }
  }
}

function _ssLoop() {
  if (_ssCards.length) _ssUpdate();
  requestAnimationFrame(_ssLoop);
}

function _ssRecache() {
  for (var i = 0; i < _ssCards.length; i++) {
    _ssCards[i].style.transform = 'none';
    _ssBaseOffsets[i] = _ssOffset(_ssCards[i]);
    _ssCards[i].style.transform = 'translate3d(0,0,0)';
  }
  var m = document.querySelector('.scroll-stack-end');
  if (m) { m.style.transform = 'none'; _ssEndOffset = _ssOffset(m); }
  _ssLastY = []; _ssLastS = [];
  _ssUpdate();
}

function initScrollStack() {
  var cards = document.querySelectorAll('.scroll-stack-card');
  if (!cards.length) return;

  _ssCards = Array.prototype.slice.call(cards);
  _ssBaseOffsets = [];
  _ssLastY = [];
  _ssLastS = [];

  _ssCards.forEach(function(card, i) {
    card.style.transform = 'none';
    _ssBaseOffsets[i] = _ssOffset(card);
    card.style.marginBottom = (i < _ssCards.length - 1) ? '24px' : '0';
    card.style.willChange = 'transform';
    card.style.transformOrigin = 'top center';
    card.style.backfaceVisibility = 'hidden';
    card.style.transform = 'translate3d(0,0,0)';
  });

  var inner = document.getElementById('projectsGrid');
  if (inner) {
    var marker = inner.querySelector('.scroll-stack-end');
    if (!marker) {
      marker = document.createElement('div');
      marker.className = 'scroll-stack-end';
      inner.appendChild(marker);
    }
    marker.style.transform = 'none';
    _ssEndOffset = _ssOffset(marker);
  }

  _ssUpdate();

  if (!_ssActive) {
    _ssActive = true;
    window.addEventListener('resize', function() {
      clearTimeout(_ssResizeTimer);
      _ssResizeTimer = setTimeout(_ssRecache, 150);
    }, { passive: true });
    requestAnimationFrame(_ssLoop);
  }
}


/* ══════════════════════════════════════════
   3-STEP STEPPER
   ══════════════════════════════════════════ */
var _stepperCurrentStep = 1;

function _stepperShowPanel(panelId, direction) {
  var all = document.querySelectorAll('.step-panel');
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove('active', 'slide-back');
  }
  var target = document.querySelector('.step-panel[data-panel="' + panelId + '"]');
  if (!target) return;
  if (direction === 'back') target.classList.add('slide-back');
  target.classList.add('active');
}

function _stepperUpdateHeader(step) {
  var indicators = document.querySelectorAll('.step-indicator');
  for (var i = 0; i < indicators.length; i++) {
    var s = parseInt(indicators[i].dataset.step);
    indicators[i].classList.remove('active', 'completed');
    if (s < step)       indicators[i].classList.add('completed');
    else if (s === step) indicators[i].classList.add('active');
  }
  var connectors = document.querySelectorAll('.step-connector');
  for (var j = 0; j < connectors.length; j++) {
    if (j < step - 1) connectors[j].classList.add('active');
    else              connectors[j].classList.remove('active');
  }
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
  input.style.borderColor = '';
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
  var name    = (document.getElementById('formName')    ? document.getElementById('formName').value    : '').trim();
  var email   = (document.getElementById('formEmail')   ? document.getElementById('formEmail').value   : '').trim();
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
