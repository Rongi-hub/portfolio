(function () {
  'use strict';

  function initHeroTagCube() {
    var cube = document.querySelector('.hero__tag-cube');
    if (!cube) return;

    var faces = Array.prototype.slice.call(cube.querySelectorAll('.hero__tag-face'));
    if (!faces.length) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var styleEl = document.getElementById('hero-tag-cube-width-keyframes');
    var resizeTimer;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'hero-tag-cube-width-keyframes';
      document.head.appendChild(styleEl);
    }

    function measureFaceWidth(face) {
      var clone = face.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.style.cssText =
        'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;' +
        'width:max-content;height:auto;inset:auto;transform:none;display:flex;align-items:center;';
      cube.appendChild(clone);
      var width = clone.scrollWidth;
      cube.removeChild(clone);
      return width;
    }

    function measureWidths() {
      return faces.map(function (face) {
        return Math.ceil(measureFaceWidth(face)) + 2;
      });
    }

    function applyWidths() {
      var widths = measureWidths();
      var w = function (i) { return widths[i] + 'px'; };

      cube.style.width = w(0);
      cube.style.minWidth = '0';
      cube.style.maxWidth = 'none';

      if (reducedMotion) {
        styleEl.textContent = '';
        cube.style.animation = 'none';
        return;
      }

      styleEl.textContent =
        '@keyframes hero-tag-cube-width {' +
        '0%, 20.833% { width: ' + w(0) + '; animation-timing-function: ease-in-out; }' +
        '20.834%, 45.833% { width: ' + w(1) + '; animation-timing-function: ease-in-out; }' +
        '45.834%, 70.833% { width: ' + w(2) + '; animation-timing-function: ease-in-out; }' +
        '70.834%, 99.999% { width: ' + w(3) + '; animation-timing-function: ease-in-out; }' +
        '100% { width: ' + w(0) + '; }' +
        '}';

      cube.style.animation = 'hero-tag-cube-width 12s infinite';
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyWidths);
    } else {
      applyWidths();
    }

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyWidths, 150);
    });
  }

  /* Page ready — triggers hero / page enter transitions */
  requestAnimationFrame(function () {
    document.body.classList.add('page-ready');
  });

  /* Reveal on scroll with stagger */
  var observerTargets = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );

    observerTargets.forEach(function (el, index) {
      el.style.setProperty('--reveal-delay', Math.min(index * 70, 350) + 'ms');
      observer.observe(el);
    });

    function revealInView() {
      observerTargets.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }

    requestAnimationFrame(revealInView);
  } else {
    observerTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* Hero tag cube — responsive width per face */
  initHeroTagCube();

  /* Contact form (Formspree) */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('contact-submit');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      statusEl.textContent = 'Form not configured yet — replace YOUR_FORM_ID in index.html with your Formspree form ID.';
      statusEl.className = 'form-status form-status--error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          statusEl.textContent = 'Message sent — thank you! I will get back to you soon.';
          statusEl.className = 'form-status form-status--success';
        } else {
          return response.json().then(function (data) {
            var message = data.errors
              ? data.errors.map(function (e) { return e.message; }).join(', ')
              : 'Something went wrong. Please try again.';
            throw new Error(message);
          });
        }
      })
      .catch(function (err) {
        statusEl.textContent = err.message || 'Could not send message. Please try again.';
        statusEl.className = 'form-status form-status--error';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      });
  });
})();
