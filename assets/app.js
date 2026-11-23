(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var guides = {
    setup: document.getElementById('guide-setup'),
    won: document.getElementById('guide-won')
  };
  var head = document.querySelector('.head');

  function headHeight() {
    return head ? Math.round(head.getBoundingClientRect().height) : 0;
  }

  function activate(key, opts) {
    if (!guides[key]) return;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    Object.keys(guides).forEach(function (k) {
      guides[k].hidden = (k !== key);
    });
    if (opts && opts.scroll) {
      var el = guides[key];
      var top = el.getBoundingClientRect().top + window.pageYOffset - headHeight() - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    if (history.replaceState) {
      history.replaceState(null, '', key === 'won' ? '#won' : '#setup');
    }
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      activate(t.getAttribute('data-tab'), { scroll: true });
    });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      activate(next.getAttribute('data-tab'), { scroll: true });
    });
  });

  if (location.hash === '#won') activate('won', { scroll: false });
  else activate('setup', { scroll: false });

  /* reading progress */
  var bar = document.getElementById('progressBar');
  var ticking = false;
  function draw() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.pageYOffset / h)) : 0;
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(draw);
    }
  }, { passive: true });
  window.addEventListener('resize', draw);
  draw();

  /* in-page anchors (#s1 …) should clear the sticky header */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - headHeight() - 10;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
})();
