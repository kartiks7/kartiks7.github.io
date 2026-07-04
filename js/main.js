/* Kartik Shende — portfolio interactions
   theme toggle · scroll reveals · stat counters · active nav ·
   parabolic scroll glow · hero data-drift canvas · lazy Power BI embed */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.content = theme === 'dark' ? '#05070B' : '#F7F9FC';
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Stat counters ---------- */
  function formatStat(el, value) {
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    el.textContent =
      (el.dataset.prefix || '') + value.toFixed(decimals) + (el.dataset.suffix || '');
  }

  function runCounter(el) {
    var target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    if (reducedMotion.matches) { formatStat(el, target); return; }
    var duration = 1400;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      formatStat(el, target * eased);
      if (t < 1) requestAnimationFrame(frame);
      else formatStat(el, target); // land on exact value
    }
    requestAnimationFrame(frame);
  }

  var stats = document.querySelectorAll('.stat');
  if (stats.length) {
    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      stats.forEach(function (el) { formatStat(el, parseFloat(el.dataset.target) || 0); });
    } else {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      stats.forEach(function (el) { statObserver.observe(el); });
    }
  }

  /* ---------- Active nav highlighting ---------- */
  var navLinks = document.querySelectorAll('.nav__links a');
  var sections = [];
  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section) sections.push({ section: section, link: link });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (item) {
          var active = item.section === entry.target;
          item.link.classList.toggle('active', active);
          if (active) item.link.setAttribute('aria-current', 'true');
          else item.link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (item) { navObserver.observe(item.section); });
  }

  /* header hairline after scrolling past top sentinel */
  var header = document.querySelector('.site-header');
  var sentinel = document.querySelector('.site-header__sentinel');
  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Scroll FX: progress bar + hero-name morph ----------
     Morph: the hero name shrinks and travels into the empty nav-brand slot. */
  var morphTitle = document.querySelector('.hero__title');
  var navName = document.querySelector('.nav__name');
  var morph = null;

  function setupMorph() {
    if (!morphTitle || !navName) return;
    morphTitle.style.transform = '';
    morphTitle.style.visibility = '';
    root.classList.remove('morph-on');
    root.classList.add('brand-in');
    morph = null;
    if (reducedMotion.matches || window.innerWidth <= 880) return;
    var tr = morphTitle.getBoundingClientRect();
    var nr = navName.getBoundingClientRect();
    var titleFs = parseFloat(getComputedStyle(morphTitle).fontSize);
    var navFs = parseFloat(getComputedStyle(navName).fontSize);
    if (!tr.height || !nr.height || !titleFs) return;
    morph = {
      docTop: tr.top + window.scrollY,
      left: tr.left,
      targetX: nr.left,
      targetY: nr.top,
      scale: navFs / titleFs
    };
    morph.den = Math.max(morph.docTop - morph.targetY, 1);
    root.classList.add('morph-on');
    root.classList.remove('brand-in');
  }

  var fxTicking = false;
  function updateScrollFX() {
    fxTicking = false;
    var y = window.scrollY;

    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;
    root.style.setProperty('--scroll-p', p.toFixed(4));

    if (morph) {
      var mp = Math.min(Math.max(y / morph.den, 0), 1);
      var uy = morph.docTop - y; // untransformed viewport position
      var dx = (morph.targetX - morph.left) * mp;
      var dy = (morph.targetY - uy) * mp;
      var s = 1 - (1 - morph.scale) * mp;
      morphTitle.style.transform =
        'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      var arrived = mp >= 0.98;
      root.classList.toggle('brand-in', arrived);
      morphTitle.style.visibility = arrived ? 'hidden' : '';
    }
  }

  function requestFX() {
    if (!fxTicking) {
      fxTicking = true;
      requestAnimationFrame(updateScrollFX);
    }
  }

  if (!reducedMotion.matches) {
    window.addEventListener('scroll', requestFX, { passive: true });
    setupMorph();
    updateScrollFX();
    window.addEventListener('load', function () { setupMorph(); updateScrollFX(); });
    var fxResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(fxResizeTimer);
      fxResizeTimer = setTimeout(function () { setupMorph(); updateScrollFX(); }, 150);
    });
    if (morphTitle) {
      morphTitle.addEventListener('animationend', function () {
        morphTitle.style.animation = 'none'; // release the entrance animation's fill
        setupMorph();
        updateScrollFX();
      });
    }
  } else {
    root.classList.add('brand-in');
  }

  /* stagger index for skill pills */
  document.querySelectorAll('.pills').forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.style.setProperty('--i', Math.min(i, 14));
    });
  });

  /* ---------- Hero canvas: data drift ---------- */
  var canvas = document.getElementById('hero-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var series = [];
    var rafId = null;
    var heroVisible = true;
    var accent = '#19A7CE';
    var accent2 = '#2563EB';

    function readColors() {
      var styles = getComputedStyle(root);
      accent = styles.getPropertyValue('--accent').trim() || accent;
      accent2 = styles.getPropertyValue('--accent-2').trim() || accent2;
    }

    function sizeCanvas() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeSeries() {
      series = [];
      var lines = 3;
      var points = 9;
      for (var i = 0; i < lines; i++) {
        var pts = [];
        for (var j = 0; j < points; j++) {
          var y = height * (0.35 + Math.random() * 0.5);
          pts.push({ y: y, target: y });
        }
        series.push({
          points: pts,
          color: i === 1 ? accent2 : accent,
          alpha: 0.1 + i * 0.045,
          pulse: Math.floor(Math.random() * points)
        });
      }
    }

    function retarget() {
      series.forEach(function (line) {
        line.points.forEach(function (pt) {
          pt.target = height * (0.3 + Math.random() * 0.55);
        });
        line.pulse = Math.floor(Math.random() * line.points.length);
      });
    }

    var pulseT = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);
      var step = width / (9 - 1);
      series.forEach(function (line) {
        var pts = line.points;
        pts.forEach(function (pt) { pt.y += (pt.target - pt.y) * 0.015; });

        ctx.beginPath();
        ctx.moveTo(0, pts[0].y);
        for (var j = 1; j < pts.length; j++) {
          var xPrev = (j - 1) * step;
          var xCurr = j * step;
          var xMid = (xPrev + xCurr) / 2;
          ctx.quadraticCurveTo(xPrev, pts[j - 1].y, xMid, (pts[j - 1].y + pts[j].y) / 2);
        }
        ctx.lineTo(width, pts[pts.length - 1].y);
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = line.alpha;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // data dots, one softly pulsing per line
        for (var k = 0; k < pts.length; k += 2) {
          var isPulse = k === line.pulse;
          var r = isPulse ? 2.5 + Math.sin(pulseT) * 1.2 : 2;
          ctx.beginPath();
          ctx.arc(k * step, pts[k].y, Math.max(r, 0.5), 0, Math.PI * 2);
          ctx.fillStyle = line.color;
          ctx.globalAlpha = isPulse ? line.alpha * 2.4 : line.alpha * 1.6;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    }

    function loop() {
      pulseT += 0.04;
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (rafId === null && heroVisible && !document.hidden && !reducedMotion.matches) {
        rafId = requestAnimationFrame(loop);
      }
    }

    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    readColors();
    sizeCanvas();
    makeSeries();
    draw(); // static first frame (all reduced-motion gets)

    if (!reducedMotion.matches) {
      startLoop();
      setInterval(retarget, 3500);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        sizeCanvas();
        makeSeries();
        draw();
      }, 150);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopLoop();
      else startLoop();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) startLoop();
        else stopLoop();
      }).observe(canvas);
    }

    document.addEventListener('themechange', function () {
      readColors();
      series.forEach(function (line, i) {
        line.color = i === 1 ? accent2 : accent;
      });
      draw();
    });

    reducedMotion.addEventListener('change', function () {
      if (reducedMotion.matches) { stopLoop(); draw(); }
      else startLoop();
    });
  }

  /* ---------- Lazy Power BI embed ---------- */
  document.querySelectorAll('.embed-load').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var container = btn.parentElement;
      var iframe = document.createElement('iframe');
      iframe.src = btn.dataset.embedSrc;
      iframe.title = btn.dataset.embedTitle || 'Embedded report';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';
      container.textContent = '';
      container.appendChild(iframe);
      iframe.focus();
    });
  });
})();
