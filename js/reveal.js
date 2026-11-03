/* GrowLab · section entrances (for everything that has no motion of its own).
   Headings: each word rises out of a mask. Small labels, leads, links and notes fade up.
   Groups (price cards, plans, FAQ rows, About roles, chips, the form fields) arrive one after another.
   Plays once per element as it enters. Nothing is hidden until the script is running;
   reduced motion: no entrances at all. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  var E = 'cubic-bezier(.23,1,.32,1)';
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* split a heading into masked words, keeping <em> and other inline tags */
  function split(el) {
    var words = [];
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var o = document.createElement('span'), i = document.createElement('span');
            o.className = 'rv-w'; i.className = 'rv-wi'; i.textContent = p;
            o.appendChild(i); frag.appendChild(o); words.push(i);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('slot')) walk(n);
      });
    })(el);
    return words;
  }

  var jobs = [];
  function add(el, play) { if (!el || el.dataset.rv) return; el.dataset.rv = '1'; jobs.push({ el: el, play: play }); }
  function fade(el, delay, y) {
    el.style.opacity = '0';
    return function () {
      el.style.opacity = '';
      el.animate([{ opacity: 0, transform: 'translateY(' + (y || 18) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 750, delay: delay || 0, easing: E, fill: 'backwards' });
    };
  }

  /* 1 · section headings (not the hero headline, the welcome gate or the 3D/scroll scenes) */
  $$('main section h2').forEach(function (h) {
    if (h.closest('.hero,.gate,.qs,.mth-st,.cc,.ofr-stage')) return;
    var words = split(h);
    words.forEach(function (w) { w.style.transform = 'translateY(110%)'; });
    add(h, function () {
      words.forEach(function (w, i) {
        w.style.transform = '';
        w.animate([{ transform: 'translateY(110%) rotate(4deg)' }, { transform: 'none' }], { duration: 900, delay: i * 45, easing: E, fill: 'backwards' });
      });
    });
  });

  /* 2 · single elements that fade up */
  $$('main section .tag, main section > .w > .lead, main section .nx, main section > .w > .fine, #about .lead, #about .fine, #prices .gb, #offer .def, .wk-l').forEach(function (el) {
    if (el.closest('.hero .hg,.gate,.cc,.mth-st,.cta')) return;
    add(el, fade(el, el.classList.contains('tag') ? 0 : 120));
  });

  /* 3 · hero supporting lines (the headline stays put: the ball sits on its period) */
  (function () {
    var hx = document.querySelector('.hero .hx');
    if (!hx) return;
    var parts = $$('.hello:not([hidden]), .tag, .lead, .dial, .acts, .ticks', hx);
    parts.forEach(function (el) { el.style.opacity = '0'; });
    var ph = document.querySelector('.hero .ph');
    if (ph) ph.style.opacity = '0';
    var go = function () {
      parts.forEach(function (el, i) {
        el.style.opacity = '';
        el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 150 + i * 90, easing: E, fill: 'backwards' });
      });
      if (ph) {
        ph.style.opacity = '';
        ph.animate([{ opacity: 0, transform: 'translateY(30px) scale(.97)', clipPath: 'inset(20% 0 0 0 round 36px)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0 round 36px)' }], { duration: 1100, delay: 250, easing: E, fill: 'backwards' });
      }
    };
    // wait for the welcome gate to close on a first visit
    if (document.documentElement.classList.contains('gate-on')) {
      var mo = new MutationObserver(function () { if (!document.documentElement.classList.contains('gate-on')) { mo.disconnect(); go(); } });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    } else go();
  })();

  /* 4 · groups that arrive one after another */
  function group(sel, item, opts) {
    $$(sel).forEach(function (g) {
      var kids = $$(item, g).filter(function (k) { return !k.hidden; });
      if (!kids.length) return;
      kids.forEach(function (k) { k.style.opacity = '0'; });
      add(g, function () {
        kids.forEach(function (k, i) {
          k.style.opacity = '';
          k.animate([{ opacity: 0, transform: opts.from }, { opacity: 1, transform: 'none' }], { duration: opts.d || 800, delay: i * (opts.s || 90), easing: E, fill: 'backwards' });
        });
      });
    });
  }
  group('#prices .pg', '.pc', { from: 'translateY(40px) rotateX(-12deg)', s: 110 });
  group('#prices .mo', 'article', { from: 'translateY(24px)' });
  group('#faq .faq', 'details', { from: 'translateX(-24px)', s: 70 });
  group('#about .xp', 'li', { from: 'translateX(30px)', s: 70 });
  group('#about .chips.ol', 'li', { from: 'translateY(12px) scale(.9)', s: 40, d: 600 });
  group('#gap .qx', '.qcard', { from: 'translateY(30px)' });
  group('#start form', ':scope > *', { from: 'translateY(16px)', s: 50, d: 650 });
  group('#start .cta > div:first-child', ':scope > *', { from: 'translateY(16px)', s: 80 });
  group('#pools', '.pf-bar, .key', { from: 'translateY(14px)', s: 80 });
  group('.ft', '.ft-big, .w:not(.ft-big)', { from: 'translateY(24px)', s: 120 });

  /* the CTA box itself grows in */
  var cta = document.querySelector('#start .cta');
  if (cta) {
    cta.style.opacity = '0';
    add(cta, function () {
      cta.style.opacity = '';
      cta.animate([{ opacity: 0, transform: 'translateY(40px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 1000, easing: E, fill: 'backwards' });
    });
  }

  /* run each one once, as it enters */
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var j = jobs.filter(function (x) { return x.el === e.target; })[0];
      if (j) j.play();
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  jobs.forEach(function (j) {
    // already on screen when the page opens: play right away
    var r = j.el.getBoundingClientRect();
    if (r.top < innerHeight * 0.88 && r.bottom > 0) { j.play(); return; }
    io.observe(j.el);
  });
})();
