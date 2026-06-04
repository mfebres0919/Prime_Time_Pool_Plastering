/* ============================================================
   PRIME TIME POOL PLASTERING — js/main.js
   Site-wide interactions:
     • Mobile drawer (open/close, overlay, Esc)
     • Navbar scroll shadow
     • Scroll-reveal (IntersectionObserver)
     • Scroll-to-top button
   Section-specific behavior (finishes flip, stats, etc.) is
   added here as those sections are built.
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile drawer ───────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const drawer    = document.getElementById('navDrawer');
  const overlay   = document.querySelector('.nav-overlay');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay && overlay.classList.add('is-active');
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay && overlay.classList.remove('is-active');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger && hamburger.addEventListener('click', openDrawer);
  document.querySelectorAll('[data-drawer-close]').forEach(function (el) {
    el.addEventListener('click', closeDrawer);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ── Navbar scroll shadow ────────────────────── */
  const navbar = document.getElementById('navbar');
  function onScrollNav() {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ── Scrollspy: highlight the nav link for the section in view ── */
  var spyMap = [
    { id: 'hero',     href: 'index.html' },
    { id: 'about',    href: '#about' },
    { id: 'finishes', href: '#finishes' },
    { id: 'services', href: '#services' },
    { id: 'work',     href: '#work' }
  ];
  var spyLinks = {};
  spyMap.forEach(function (s) {
    spyLinks[s.id] = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href="' + s.href + '"], .nav-drawer a[href="' + s.href + '"]')
    );
  });
  var spySections = spyMap
    .map(function (s) { return document.getElementById(s.id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    var setActiveNav = function (id) {
      Object.keys(spyLinks).forEach(function (key) {
        spyLinks[key].forEach(function (a) { a.classList.toggle('is-active', key === id); });
      });
    };
    var spyIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActiveNav(e.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spySections.forEach(function (sec) { spyIo.observe(sec); });
  }

  /* ── Scroll reveal ───────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Finishes: drag-to-scroll + tap-to-flip ──── */
  const finWrap = document.querySelector('.finishes-wrap');
  if (finWrap) {
    let down = false, startX = 0, startScroll = 0, moved = 0;

    finWrap.addEventListener('pointerdown', function (e) {
      down = true; moved = 0;
      startX = e.clientX;
      startScroll = finWrap.scrollLeft;
      finWrap.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      finWrap.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      down = false;
      finWrap.classList.remove('is-dragging');
    });

    // Flip on tap (ignore if it was a drag); toggle others closed for tidiness
    finWrap.querySelectorAll('.finish-card').forEach(function (card) {
      card.addEventListener('click', function () {
        if (moved > 6) return;             // it was a drag, not a tap
        card.classList.toggle('is-flipped');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-flipped');
        }
      });
    });
  }

  /* ── Tighter video loops ──────────────────────
     Native `loop` restarts only after hitting end-of-stream, which can
     stall for a beat. Resetting a hair early avoids that EOS hitch. */
  document.querySelectorAll('.work-video, .hero-video').forEach(function (v) {
    v.addEventListener('timeupdate', function () {
      if (v.duration && v.currentTime >= v.duration - 0.25) {
        v.currentTime = 0;
      }
    });
  });

  /* ── Scroll-to-top ───────────────────────────── */
  const toTop = document.querySelector('.scroll-top-btn');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
