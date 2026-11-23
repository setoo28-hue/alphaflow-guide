(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var guides = {
    setup: document.getElementById('guide-setup'),
    won: document.getElementById('guide-won')
  };
  var head = document.querySelector('.head');

  /* 12/1 00:00 KST 유료 전환 — 1~2장만 무료, 3장부터 잠금
     ?lock=1 은 12월 화면 미리보기용(잠금만 걸고 풀지는 않는다) */
  var LOCK_AT = Date.UTC(2026, 11, 1, 0, 0, 0) - 9 * 3600 * 1000;
  var locked = /[?&]lock=1(?:&|$)/.test(location.search) || Date.now() >= LOCK_AT;
  var lockedBody = document.getElementById('lockedBody');
  var lockCard = document.getElementById('lockCard');

  document.documentElement.classList.toggle('is-locked', locked);

  if (locked && lockedBody) {
    lockedBody.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(document.querySelectorAll('#guide-setup .tnav a'), function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el && lockedBody.contains(el)) {
        a.classList.add('is-pay');
        a.setAttribute('title', '12월 1일부터 유료');
      }
    });
  }

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
    /* 잠금 상태에서 3~9장 목차를 누르면 잠금 카드로 */
    if (locked && lockedBody && lockCard && lockedBody.contains(target)) target = lockCard;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headHeight() - 10;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
})();
