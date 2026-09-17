(function () {
  'use strict';

  function initHeroTagCube() {
    var cube = document.querySelector('.hero__tag-cube');
    if (!cube) return;

    var inner = cube.querySelector('.hero__tag-cube-inner');
    var sourceFaces = Array.prototype.slice.call(cube.querySelectorAll('.hero__tag-face'));
    if (!inner || !sourceFaces.length) return;

    var tags = sourceFaces.map(function (face) {
      return {
        text: face.textContent.trim(),
        tone: face.classList.contains('hero__tag-face--black') ? 'black' : 'blue'
      };
    });

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var holdMs = 1500;
    var flipMs = parseInt(getComputedStyle(cube).getPropertyValue('--tag-cube-flip-ms'), 10) || 550;
    var index = 0;
    var flipping = false;
    var holdTimer;
    var flipTimer;
    var resizeTimer;
    var front;
    var back;

    function toneClass(tone) {
      return tone === 'black' ? 'hero__tag-face--black' : 'hero__tag-face--blue';
    }

    function measureWidth(tag) {
      var probe = document.createElement('span');
      probe.className = 'hero__tag-face ' + toneClass(tag.tone);
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText =
        'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;' +
        'width:max-content;height:auto;inset:auto;transform:none;display:flex;align-items:center;';
      probe.textContent = tag.text;
      cube.appendChild(probe);
      var width = Math.ceil(probe.scrollWidth) + 2;
      cube.removeChild(probe);
      return width;
    }

    function setFace(el, slot, tag) {
      el.textContent = tag.text;
      el.className = 'hero__tag-face hero__tag-face--' + slot + ' ' + toneClass(tag.tone);
    }

    function setCubeWidth(tag, animate) {
      cube.style.transition = animate ? '' : 'none';
      cube.style.width = measureWidth(tag) + 'px';
      cube.style.minWidth = '0';
      cube.style.maxWidth = 'none';
    }

    function buildDrum() {
      front = document.createElement('span');
      back = document.createElement('span');
      inner.textContent = '';
      inner.appendChild(front);
      inner.appendChild(back);
    }

    function applyState() {
      var nextIndex = (index + 1) % tags.length;
      setFace(front, 'front', tags[index]);
      setFace(back, 'back', tags[nextIndex]);
      setCubeWidth(tags[index], false);
    }

    function scheduleNext() {
      clearTimeout(holdTimer);
      if (reducedMotion || tags.length < 2) return;
      holdTimer = setTimeout(flip, holdMs);
    }

    function afterFlip() {
      if (!flipping) return;
      clearTimeout(flipTimer);
      index = (index + 1) % tags.length;
      inner.classList.remove('is-flipping');
      inner.style.removeProperty('transition');
      inner.style.removeProperty('transform');
      void inner.offsetWidth;
      applyState();
      flipping = false;
      scheduleNext();
    }

    function flip() {
      if (flipping || tags.length < 2) return;
      flipping = true;
      var nextIndex = (index + 1) % tags.length;
      setCubeWidth(tags[nextIndex], true);
      inner.classList.remove('is-flipping');
      inner.style.removeProperty('transition');
      inner.style.removeProperty('transform');
      void inner.offsetWidth;
      requestAnimationFrame(function () {
        inner.classList.add('is-flipping');
      });
      flipTimer = setTimeout(afterFlip, flipMs + 100);
    }

    buildDrum();
    applyState();

    inner.addEventListener('transitionend', function (event) {
      if (event.target !== inner || event.propertyName !== 'transform' || !flipping) return;
      afterFlip();
    });

    if (reducedMotion) return;

    function start() {
      scheduleNext();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        applyState();
        start();
      });
    } else {
      start();
    }

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setCubeWidth(tags[index], false);
      }, 150);
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

  initScrollVideos();

  function playScrollVideo(video) {
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function startPlayback() {
      if (video.currentTime < 0.05) {
        video.currentTime = 0.05;
      }
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {});
      }
    }

    if (video.readyState >= 2) {
      startPlayback();
      return;
    }

    video.addEventListener('loadeddata', startPlayback, { once: true });
    video.load();
  }

  function initScrollVideos() {
    var videos = document.querySelectorAll('video[data-play-on-visible]');
    if (!videos.length) return;

    videos.forEach(function (video) {
      video.pause();
      video.addEventListener('play', function () {
        if (video.currentTime < 0.05) {
          video.currentTime = 0.05;
        }
      });
    });

    if (!('IntersectionObserver' in window)) {
      videos.forEach(playScrollVideo);
      return;
    }

    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            playScrollVideo(video);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    videos.forEach(function (video) {
      videoObserver.observe(video);

      var rect = video.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        playScrollVideo(video);
      }
    });
  }

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
