/* ══════════════════════════════════════════
   LENIS SMOOTH SCROLL
   ══════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    touchMultiplier: 2,
    infinite: false,
    wheelMultiplier: 1,
    lerp: 0.1,
    syncTouch: true,
    syncTouchLerp: 0.075
  });
  window._lenis = lenis;
  lenis.on('scroll', function() { updateScrollStack(); });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* ══════════════════════════════════════════
   SCROLL STACK ENGINE
   Ported from the React ScrollStack component
   - useWindowScroll = true
   - itemDistance = 100px
   - itemScale = 0.03
   - itemStackDistance = 30
   - stackPosition = '20%'
   - scaleEndPosition = '10%'
   - baseScale = 0.85
   - rotationAmount = 0
   - blurAmount = 0
   ══════════════════════════════════════════ */
var _ssCards = [];
var _ssBaseOffsets = [];
var _ssEndOffset = 0;
var _ssLastTransforms = {};
var _ssIsUpdating = false;

function _ssParsePercentage(value, containerHeight) {
  if (typeof value === 'string' && value.indexOf('%') !== -1) {
    return (parseFloat(value) / 100) * containerHeight;
  }
  return parseFloat(value);
}

function _ssCalcProgress(scrollTop, start, end) {
  if (scrollTop < start) return 0;
  if (scrollTop > end) return 1;
  return (scrollTop - start) / (end - start);
}

function _ssGetElementOffset(el) {
  var rect = el.getBoundingClientRect();
  return rect.top + window.scrollY;
}

function updateScrollStack() {
  if (!_ssCards.length || _ssIsUpdating) return;
  _ssIsUpdating = true;

  var scrollTop = window.scrollY;
  var containerHeight = window.innerHeight;

  var itemScale         = 0.03;
  var itemStackDistance  = 30;
  var baseScale         = 0.85;
  var stackPositionPx   = _ssParsePercentage('20%', containerHeight);
  var scaleEndPx        = _ssParsePercentage('10%', containerHeight);
  var rotationAmount    = 0; // Lock to 0 to prevent "bending"
  var blurAmount        = 0; // Lock to 0 for performance/clarity

  // Find top-most card in stack (using cached offsets)
  var topCardIndex = 0;
  for (var j = 0; j < _ssCards.length; j++) {
    var jTriggerStart = _ssBaseOffsets[j] - stackPositionPx - itemStackDistance * j;
    if (scrollTop >= jTriggerStart) {
      topCardIndex = j;
    }
  }

  for (var i = 0; i < _ssCards.length; i++) {
    var card = _ssCards[i];
    var cardBaseTop = _ssBaseOffsets[i];

    var triggerStart = cardBaseTop - stackPositionPx - itemStackDistance * i;
    var triggerEnd   = cardBaseTop - scaleEndPx;
    var pinStart     = cardBaseTop - stackPositionPx - itemStackDistance * i;
    var pinEnd       = _ssEndOffset - containerHeight / 2;

    var scaleProgress = _ssCalcProgress(scrollTop, triggerStart, triggerEnd);
    var targetScale   = baseScale + i * itemScale;
    var scale         = 1 - scaleProgress * (1 - targetScale);
    
    var rotation = 0;
    var blur     = 0;

    var translateY = 0;
    if (scrollTop >= pinStart && scrollTop <= pinEnd) {
      translateY = scrollTop - cardBaseTop + stackPositionPx + itemStackDistance * i;
    } else if (scrollTop > pinEnd) {
      translateY = pinEnd - cardBaseTop + stackPositionPx + itemStackDistance * i;
    }

    // Clean decimals for performance
    translateY = Math.round(translateY * 10) / 10;
    scale      = Math.round(scale * 1000) / 1000;

    var last = _ssLastTransforms[i];
    var changed = !last ||
      Math.abs(last.translateY - translateY) > 0.1 ||
      Math.abs(last.scale - scale) > 0.001;

    if (changed) {
      card.style.transform = 'translate3d(0,' + translateY + 'px,0) scale(' + scale + ')';
      _ssLastTransforms[i] = { translateY: translateY, scale: scale };
    }
  }

  _ssIsUpdating = false;
}

function initScrollStack() {
  var cards = document.querySelectorAll('.scroll-stack-card');
  if (!cards.length) return;

  _ssCards = Array.prototype.slice.call(cards);
  _ssBaseOffsets = [];
  _ssLastTransforms = {};
  _ssIsUpdating = false;

  var itemDistance = 24; // px margin between cards

  // Measurement Phase
  _ssCards.forEach(function(card, i) {
    // Temporarily reset transform to measure true documentary position
    card.style.transform = 'none';
    _ssBaseOffsets[i] = _ssGetElementOffset(card);

    // Add gap between cards
    if (i < _ssCards.length - 1) {
      card.style.marginBottom = itemDistance + 'px';
    } else {
      card.style.marginBottom = '0';
    }
    card.style.willChange      = 'transform';
    card.style.transformOrigin = 'top center';
    card.style.transform       = 'translate3d(0, 0, 0)';
  });

  // Measure end marker
  var inner = document.getElementById('projectsGrid');
  if (inner) {
    var marker = inner.querySelector('.scroll-stack-end');
    if (!marker) {
      marker = document.createElement('div');
      marker.className = 'scroll-stack-end';
      inner.appendChild(marker);
    }
    // Measure marker static pos
    marker.style.transform = 'none';
    _ssEndOffset = _ssGetElementOffset(marker);
  }

  // Bind resize to re-cache
  window.addEventListener('resize', function() {
    _ssCards.forEach(function(card, i) {
      card.style.transform = 'none';
      _ssBaseOffsets[i] = _ssGetElementOffset(card);
    });
    var marker = document.querySelector('.scroll-stack-end');
    if (marker) {
      marker.style.transform = 'none';
      _ssEndOffset = _ssGetElementOffset(marker);
    }
    updateScrollStack();
  }, { passive: true });

  // Wire window scroll
  window.addEventListener('scroll', function() {
    requestAnimationFrame(updateScrollStack);
  }, { passive: true });

  updateScrollStack();
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
