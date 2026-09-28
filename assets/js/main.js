/* Financial Passport — interactions & motion (M-IDs refer to the UI/UX & Motion Brief, section 15). */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rmQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => rmQuery.matches;
  const isDesktop = () => matchMedia('(min-width: 1024px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const inr = n => Math.round(n).toLocaleString('en-IN');

  // Run a callback once when an element enters the viewport.
  const once = (els, cb, opts = {}) => {
    const list = [].concat(els).filter(Boolean);
    if (!list.length) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); }
    }), { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? '0px 0px -15% 0px' });
    list.forEach(el => io.observe(el));
  };
  // Toggle a class while an element is off-screen (pauses loops: M-13, M-60, M-113).
  const whileVisible = (el, onChange) => {
    if (!el) return;
    new IntersectionObserver(([e]) => onChange(e.isIntersecting)).observe(el);
  };

  /* ---------- toast ---------- */
  let toastEl, toastT;
  const toast = msg => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.append(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('is-shown'));
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-shown'), 2250);
  };

  /* ---------- M-01 page load ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('loaded')));

  /* ---------- header: M-02 ---------- */
  const header = $('[data-header]');
  let lastY = scrollY;
  const onScrollHeader = () => {
    if (!header) return;
    const y = scrollY;
    header.classList.toggle('is-solid', y > 80);
    const menuOpen = document.body.classList.contains('menu-open');
    const dropOpen = $('.dropdown.is-open');
    if (!menuOpen && !dropOpen && y > 200 && y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 200) header.classList.remove('is-hidden');
    lastY = y;
  };

  /* ---------- M-03 scroll-spy ---------- */
  const nav = $('.main-nav');
  const indicator = $('.nav-indicator');
  const spyLinks = $$('[data-spy]');
  const moveIndicator = el => {
    if (!indicator || !nav) return;
    if (!el) { indicator.style.setProperty('--o', 0); return; }
    const n = nav.getBoundingClientRect(), r = el.getBoundingClientRect();
    indicator.style.setProperty('--x', `${r.left - n.left + 12}px`);
    indicator.style.setProperty('--s', (r.width - 24) / 100);
    indicator.style.setProperty('--o', 1);
  };
  const spyTargets = spyLinks.map(l => document.getElementById(l.dataset.spy)).filter(Boolean);
  if (spyTargets.length) {
    const visible = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => visible.set(e.target.id, e.isIntersecting));
      const active = spyTargets.find(t => visible.get(t.id));
      spyLinks.forEach(l => l.classList.toggle('is-active', !!active && l.dataset.spy === active.id));
      moveIndicator(active ? spyLinks.find(l => l.dataset.spy === active.id) : null);
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(t => io.observe(t));
  } else {
    moveIndicator($('.main-nav [aria-current="page"]'));
  }
  addEventListener('resize', () => moveIndicator($('.main-nav .is-active') || $('.main-nav [aria-current="page"]')));

  /* ---------- M-05 programs dropdown ---------- */
  const dropBtn = $('.nav-drop-btn'), dropdown = $('#programs-menu');
  if (dropBtn && dropdown) {
    const setDrop = open => {
      dropBtn.setAttribute('aria-expanded', open); dropdown.classList.toggle('is-open', open);
      if (open) header?.classList.remove('is-hidden');
    };
    const li = dropBtn.closest('li');
    let t;
    dropBtn.addEventListener('click', () => setDrop(dropBtn.getAttribute('aria-expanded') !== 'true'));
    li.addEventListener('mouseenter', () => { clearTimeout(t); if (matchMedia('(hover:hover)').matches) setDrop(true); });
    li.addEventListener('mouseleave', () => { t = setTimeout(() => setDrop(false), 150); });
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) setDrop(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dropdown.classList.contains('is-open')) { setDrop(false); dropBtn.focus(); } });
  }

  /* ---------- M-04 mobile menu ---------- */
  const menuBtn = $('.menu-btn'), sheet = $('#mobile-sheet');
  if (menuBtn && sheet) {
    sheet.hidden = false;
    $$('.sheet-list > li', sheet).forEach((li, i) => li.style.setProperty('--i', i));
    const setMenu = open => {
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      sheet.setAttribute('aria-hidden', !open);
      sheet.inert = !open;
      if (open) header?.classList.remove('is-hidden');
    };
    setMenu(false);
    menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
    const accBtn = $('.sheet-acc-btn', sheet);
    accBtn?.addEventListener('click', () => {
      const open = accBtn.getAttribute('aria-expanded') !== 'true';
      accBtn.setAttribute('aria-expanded', open);
      $('#' + accBtn.getAttribute('aria-controls')).classList.toggle('is-open', open);
    });
    addEventListener('resize', () => { if (isDesktop()) setMenu(false); });
  }

  /* ---------- M-07 anchor scroll: move focus to the section heading ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    // M-20 "anchor jump": sections already passed show instantly with no animation queue
    $$('.reveal:not(.is-in)').forEach(el => { if (el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) el.classList.add('is-in'); });
    target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', url.hash);
    const focusEl = target.querySelector('h2, h1') || target;
    focusEl.setAttribute('tabindex', '-1');
    setTimeout(() => focusEl.focus({ preventScroll: true }), reduced() ? 0 : 500);
    if (a.dataset.interest) setInterest(a.dataset.interest, true);
  });

  /* ---------- reveal + stagger: M-20, M-21, M-30 ---------- */
  $$('[data-stagger]').forEach(group => {
    [...group.children].forEach((c, i) => { c.style.setProperty('--i', Math.min(i, 6)); if (!c.classList.contains('no-reveal')) c.classList.add('reveal'); });
  });
  // Trigger when the element's top reaches 85% of the viewport height (works for tall elements too).
  once($$('.reveal'), el => el.classList.add('is-in'), { threshold: 0 });
  // Generic in-view class for components with their own animations
  once($$('[data-inview]'), el => el.classList.add('is-in'), { threshold: 0.4, rootMargin: '0px' });

  /* ---------- M-40 icon draw-on ---------- */
  $$('.icon-draw').forEach(svg => $$('path,circle,rect,line,polyline,polygon', svg).forEach(p => p.setAttribute('pathLength', 1)));
  once($$('.icon-draw'), el => el.classList.add('is-drawn'));

  /* ---------- hero: M-10 word split, M-12 parallax, M-13 coin, M-14 cue ---------- */
  $$('.words').forEach(h => {
    let wi = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--wi', wi++);
            w.append(inner); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches('svg')) walk(n);
      });
    };
    walk(h);
  });
  const collage = $('.collage');
  if (collage) {
    setTimeout(() => collage.classList.add('is-settled'), 1400);
    if (matchMedia('(hover:hover) and (min-width:1024px)').matches && !reduced()) {
      const tiles = $$('.tile', collage);
      let raf;
      $('.hero')?.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const dx = (e.clientX / innerWidth - 0.5) * 2, dy = (e.clientY / innerHeight - 0.5) * 2;
          tiles.forEach((t, i) => { const k = [8, 5, 6, 4][i % 4]; t.style.setProperty('--px', (dx * k).toFixed(1)); t.style.setProperty('--py', (dy * k).toFixed(1)); });
        });
      });
    }
  }
  const coin = $('.coin');
  whileVisible(coin, v => coin.classList.toggle('is-paused', !v || document.hidden));
  document.addEventListener('visibilitychange', () => coin?.classList.toggle('is-paused', document.hidden));
  const cue = $('.scroll-cue');
  if (cue && !reduced()) {
    const t = setTimeout(() => cue.classList.add('is-shown'), 1500);
    addEventListener('scroll', () => { clearTimeout(t); cue.classList.remove('is-shown'); }, { once: true, passive: true });
  }

  /* ---------- M-23 carousels ---------- */
  $$('[data-carousel]').forEach(track => {
    const items = [...track.children];
    const dots = track.parentElement.querySelector('.dots');
    if (!dots) return;
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Go to card ${i + 1} of ${items.length}`);
      b.addEventListener('click', () => track.scrollTo({ left: it.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: reduced() ? 'auto' : 'smooth' }));
      dots.append(b);
    });
    const update = () => {
      const i = Math.round(track.scrollLeft / (items[1] ? items[1].offsetLeft - items[0].offsetLeft : 1));
      [...dots.children].forEach((d, k) => d.setAttribute('aria-current', k === clamp(i, 0, items.length - 1)));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
    once(track, () => {
      if (reduced() || isDesktop() || track.scrollWidth <= track.clientWidth) return;
      setTimeout(() => { track.scrollBy({ left: 24, behavior: 'smooth' }); setTimeout(() => track.scrollBy({ left: -24, behavior: 'smooth' }), 300); }, 400);
    }, { threshold: 0.6, rootMargin: '0px' });
  });

  /* ---------- M-34 AI chat typing ---------- */
  once($$('[data-chat]'), el => {
    const bub = $('.bub.q', el), text = el.dataset.chat;
    if (reduced()) { bub.textContent = text; return; }
    setTimeout(() => {
      bub.textContent = '';
      let i = 0;
      const tick = () => { bub.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 22); };
      tick();
    }, 700);
  }, { threshold: 0.5, rootMargin: '0px' });

  /* ---------- M-50 count-up ---------- */
  once($$('[data-count]'), el => {
    const target = +el.dataset.count, numEl = $('.n', el);
    const finish = () => { numEl.textContent = inr(target); el.classList.add('is-done'); };
    if (reduced()) return finish();
    const delay = (+el.dataset.i || 0) * 100, dur = 1200, start = performance.now() + delay;
    const step = now => {
      const t = clamp((now - start) / dur, 0, 1);
      numEl.textContent = inr(target * (1 - Math.pow(1 - t, 3)));
      t < 1 ? requestAnimationFrame(step) : finish();
    };
    requestAnimationFrame(step);
  }, { threshold: 0.5, rootMargin: '0px' });

  /* ---------- M-51 CTA pulse ---------- */
  once($$('[data-pulse]'), el => { if (!reduced()) { el.classList.add('pulse-once'); setTimeout(() => el.classList.remove('pulse-once'), 900); } }, { threshold: 0.6, rootMargin: '0px' });

  /* ---------- M-60 marquee ---------- */
  $$('.marquee').forEach(m => {
    whileVisible(m, v => m.classList.toggle('is-offscreen', !v));
    m.addEventListener('touchstart', () => m.classList.add('is-paused'), { passive: true });
    m.addEventListener('touchend', () => { if (!m.dataset.userPaused) m.classList.remove('is-paused'); });
    const btn = m.parentElement.querySelector('.pause-btn');
    btn?.addEventListener('click', () => {
      const paused = m.dataset.userPaused !== '1';
      m.dataset.userPaused = paused ? '1' : '';
      m.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-pressed', paused);
      $('.lbl', btn).textContent = paused ? 'Play logos' : 'Pause logos';
    });
  });

  /* ---------- M-80 accordion ---------- */
  $$('.acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const acc = btn.closest('.acc'), group = btn.closest('[data-acc-group]');
      const open = !acc.classList.contains('is-open');
      if (group && open) $$('.acc.is-open', group).forEach(o => { o.classList.remove('is-open'); $('.acc-btn', o).setAttribute('aria-expanded', 'false'); });
      acc.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- scroll-linked: M-72 ladders, M-73 path, M-76 counter, M-103 clock, M-111 pinned ---------- */
  const scrollFns = [];
  // 0 when the element's top is at startFrac of the viewport, 1 when it reaches endFrac.
  const progressOf = (el, startFrac, endFrac) => {
    const top = el.getBoundingClientRect().top, vh = innerHeight;
    return clamp((vh * startFrac - top) / (vh * (startFrac - endFrac)), 0, 1);
  };

  $$('[data-ladder]').forEach(ladder => {
    const steps = $$('.ladder-step', ladder), track = $('.ladder-track', ladder);
    const set = p => {
      track?.style.setProperty('--p', p);
      steps.forEach((s, i) => s.classList.toggle('reached', p >= (steps.length === 1 ? 0 : i / (steps.length - 1)) - 0.001));
    };
    if (reduced()) return set(1);
    scrollFns.push(() => set(progressOf(ladder, 0.85, 0.35)));
  });

  const journey = $('[data-journey]');
  if (journey) {
    const svg = $('.journey-rail svg', journey), base = $('.base', svg), ink = $('.ink', svg), maskLine = $('#journeyMaskLine');
    const stages = $$('.stage', journey);
    const counter = $('.stage-counter b', journey);
    const sizeRail = () => {
      const h = svg.getBoundingClientRect().height;
      svg.setAttribute('viewBox', `0 0 4 ${h}`);
      [base, ink, maskLine].forEach(l => l.setAttribute('y2', h));
    };
    sizeRail(); addEventListener('resize', sizeRail);
    once(stages, s => s.classList.add('stamped'), { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
    let cur = 1;
    scrollFns.push(() => {
      const rail = $('.journey-rail', journey).getBoundingClientRect();
      const p = reduced() ? 1 : clamp((innerHeight * 0.6 - rail.top) / rail.height, 0, 1);
      maskLine.style.strokeDashoffset = 1 - p;
      let n = 1;
      stages.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.55) n = i + 1; });
      if (n !== cur && counter) {
        cur = n;
        if (reduced()) { counter.textContent = n; return; }
        counter.style.transform = 'translateY(-100%)';
        setTimeout(() => { counter.style.transition = 'none'; counter.textContent = n; counter.style.transform = 'translateY(100%)';
          requestAnimationFrame(() => { counter.style.transition = ''; counter.style.transform = ''; }); }, 180);
      }
    });
  }

  const clock = $('[data-clock]');
  if (clock) {
    const qs = $$('.q', clock), num = $('.center b', clock), hours = $$('.hour');
    scrollFns.push(() => {
      let n = 0;
      hours.forEach((h, i) => { if (reduced() || h.getBoundingClientRect().top < innerHeight * 0.6) n = i + 1; });
      qs.forEach((q, i) => q.classList.toggle('on', i < n));
      hours.forEach((h, i) => h.classList.toggle('active', i === n - 1));
      num.textContent = n;
    });
  }

  // M-111: desktop-only pinned horizontal scroll through 7 steps
  const hs = $('[data-hscroll]');
  if (hs) {
    const track = $('.steps-v', hs), panels = $$('.step-panel', hs);
    const label = $('[data-step-label]'), bar = $('.hscroll-progress .bar');
    $$('.flowline', hs).forEach(f => [...f.children].forEach((c, i) => c.style.setProperty('--i', i)));
    const setLabel = i => { if (label) label.textContent = `Step ${i + 1} of ${panels.length}`; bar?.style.setProperty('--p', (i + 1) / panels.length); };
    const pinned = () => isDesktop() && !reduced();
    const apply = () => {
      hs.classList.toggle('is-pinned', pinned());
      if (!pinned()) track.style.transform = '';
    };
    apply(); addEventListener('resize', apply);
    scrollFns.push(() => {
      if (pinned()) {
        const r = hs.getBoundingClientRect(), total = hs.offsetHeight - innerHeight;
        const p = clamp(-r.top / total, 0, 1);
        const maxX = track.scrollWidth - innerWidth;
        track.style.transform = `translate3d(${-p * maxX}px,0,0)`;
        const i = Math.round(p * (panels.length - 1));
        panels.forEach((pl, k) => pl.classList.toggle('is-center', k === i));
        setLabel(i);
      } else {
        let i = 0;
        panels.forEach((pl, k) => { if (pl.getBoundingClientRect().top < innerHeight * 0.5) i = k; });
        setLabel(i);
      }
    });
    const goTo = i => {
      i = clamp(i, 0, panels.length - 1);
      if (pinned()) {
        const total = hs.offsetHeight - innerHeight;
        scrollTo({ top: hs.offsetTop + total * (i / (panels.length - 1)) + 1, behavior: reduced() ? 'auto' : 'smooth' });
      }
      panels[i].focus({ preventScroll: pinned() });
    };
    panels.forEach((pl, i) => {
      pl.addEventListener('focus', () => { if (pinned()) { const total = hs.offsetHeight - innerHeight; const want = hs.offsetTop + total * (i / (panels.length - 1)) + 1; if (Math.abs(scrollY - want) > 20) scrollTo({ top: want }); } });
      pl.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(i + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(i - 1); }
      });
    });
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScrollHeader(); scrollFns.forEach(f => f()); stickyAndTop(); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- M-09 back to top, M-30b sticky enquire bar ---------- */
  const backTop = document.createElement('button');
  backTop.className = 'back-top'; backTop.type = 'button'; backTop.setAttribute('aria-label', 'Back to top');
  backTop.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg>';
  backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }));
  document.body.append(backTop);
  const stickyBar = $('.sticky-bar');
  const contactSec = $('#contact');
  let contactInView = false;
  whileVisible(contactSec, v => { contactInView = v; stickyAndTop(); });
  function stickyAndTop() {
    backTop.classList.toggle('is-shown', scrollY > innerHeight * 2);
    if (stickyBar) {
      const pct = scrollY / (document.documentElement.scrollHeight - innerHeight);
      const show = pct > 0.4 && !contactInView;
      stickyBar.classList.toggle('is-shown', show);
      stickyBar.setAttribute('aria-hidden', !show);
      stickyBar.inert = !show;
      document.body.classList.toggle('has-sticky-bar', show && !isDesktop());
    }
  }
  onScroll();

  /* ---------- M-90 share ---------- */
  $$('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
    const data = { title: document.title, text: btn.dataset.share || document.title, url: location.href.split('#')[0] };
    if (navigator.share) { try { await navigator.share(data); } catch (_) {} return; }
    try { await navigator.clipboard.writeText(data.url); toast('Link copied'); }
    catch (_) { toast('Copy this link: ' + data.url); }
  }));

  /* ---------- copy email, phone/email wiggle ---------- */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); toast('Copied ✓'); } catch (_) { toast(btn.dataset.copy); }
  }));
  $$('a[href^="tel:"], a[href^="mailto:"]').forEach(a => a.addEventListener('click', e => {
    if (reduced() || a.dataset.go) return;
    e.preventDefault(); a.classList.add('wiggle');
    setTimeout(() => { a.classList.remove('wiggle'); a.dataset.go = '1'; a.click(); delete a.dataset.go; }, 400);
  }));

  /* ---------- M-101 CTC → take-home split ---------- */
  const ctc = $('[data-ctc]');
  if (ctc) {
    const bar = $('.ctc-bar', ctc), segs = $$('.seg', ctc), tip = $('.seg-tip', ctc), th = $('[data-takehome]', ctc);
    const target = +th.dataset.takehome;
    const run = () => {
      bar.classList.remove('is-split'); th.textContent = '₹0';
      void bar.offsetWidth;
      bar.classList.add('is-split');
      if (reduced()) { th.textContent = '₹' + inr(target); return; }
      const start = performance.now() + segs.length * 150;
      const step = now => { const t = clamp((now - start) / 800, 0, 1); th.textContent = '₹' + inr(target * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    once(bar, run, { threshold: 0.5, rootMargin: '0px' });
    $('.replay', ctc).addEventListener('click', run);
    const pick = key => {
      segs.forEach(s => s.setAttribute('aria-pressed', s.dataset.key === key));
      const s = segs.find(x => x.dataset.key === key);
      tip.innerHTML = `<b>${s.dataset.name}:</b> ${s.dataset.tip}`;
    };
    [...segs, ...$$('.seg-legend button', ctc)].forEach(b => b.addEventListener('click', () => pick(b.dataset.key)));
  }

  /* ---------- M-112 flip cards ---------- */
  $$('.flip').forEach(f => f.addEventListener('click', () => f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') !== 'true')));

  /* ---------- M-113 ambient grid ---------- */
  const ai = $('.ai-card');
  if (ai) {
    const grid = $('.ai-grid', ai);
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('i');
      d.style.left = `${Math.round(Math.random() * 20) * 5}%`; d.style.top = `${Math.round(Math.random() * 16) * 6}%`;
      d.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
      grid.append(d);
    }
    whileVisible(ai, v => ai.classList.toggle('is-offscreen', !v));
  }

  /* ---------- M-114 portfolio fan (FLIP from a stack into the grid) ---------- */
  const portfolio = $('[data-fan]');
  if (portfolio) {
    const tabs = $$('.doc-tab', portfolio);
    tabs.forEach((t, i) => t.style.setProperty('--i', i));
    if (!reduced()) {
      const stack = () => {
        const first = tabs[0].getBoundingClientRect();
        tabs.forEach((t, i) => {
          const r = t.getBoundingClientRect();
          t.style.transition = 'none';
          t.style.transform = `translate(${first.left - r.left + i * 3}px,${first.top - r.top + i * 3}px) rotate(${(i - 3.5) * 2}deg)`;
          t.style.opacity = i ? '0.9' : '1';
        });
      };
      stack();
      once(portfolio, () => {
        void portfolio.offsetWidth;
        tabs.forEach(t => { t.style.transition = ''; t.style.transform = ''; t.style.opacity = ''; });
      }, { threshold: 0.35, rootMargin: '0px' });
    }
  }

  /* ---------- contact form: M-121, M-122, M-123 ---------- */
  const interestSelect = $('#f-interest');
  function setInterest(value, flash) {
    if (!interestSelect || !value) return;
    const map = { tax: 'courses' };
    const v = map[value] || value;
    if (![...interestSelect.options].some(o => o.value === v)) return;
    interestSelect.value = v;
    interestSelect.closest('.field')?.classList.remove('has-error');
    if (flash && !reduced()) { interestSelect.classList.remove('flash'); void interestSelect.offsetWidth; interestSelect.classList.add('flash'); }
  }
  const qsInterest = new URLSearchParams(location.search).get('interest');
  if (qsInterest) setInterest(qsInterest, true);
  else if (interestSelect?.dataset.default) setInterest(interestSelect.dataset.default, false);

  const form = $('#enquiry-form');
  if (form) {
    const card = form.closest('.form-card');
    const rules = {
      name: v => v.trim().length >= 2 && v.trim().length <= 80 ? '' : (v.trim() ? 'Please enter 2 to 80 characters.' : 'We need this one to reach you.'),
      email: v => !v.trim() ? 'We need this one to reach you.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : "That email doesn't look right. Check for a typo?"),
      phone: v => !v || /^\d{10}$/.test(v.replace(/\s/g, '')) ? '' : 'Please enter a 10-digit mobile number.',
      interest: v => v ? '' : 'We need this one to reach you.',
      message: v => v.trim().length >= 10 && v.length <= 1000 ? '' : (v.trim() ? 'Please write between 10 and 1,000 characters.' : 'We need this one to reach you.'),
    };
    const check = (input, nudge) => {
      const rule = rules[input.name];
      if (!rule) return true;
      const msg = rule(input.value);
      const field = input.closest('.field');
      const err = $('.err span', field);
      if (msg) {
        err.textContent = msg;
        if (nudge) { field.classList.remove('has-error'); void field.offsetWidth; }
        field.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      }
      return !msg;
    };
    $$('input, select, textarea', form).forEach(inp => {
      inp.addEventListener('blur', () => { if (inp.value || inp.dataset.touched) check(inp, true); inp.dataset.touched = '1'; });
      inp.addEventListener('input', () => { if (inp.closest('.field')?.classList.contains('has-error')) check(inp, false); });
    });
    const phone = form.elements.phone;
    phone?.addEventListener('input', () => { phone.value = phone.value.replace(/\D/g, '').slice(0, 10); });
    const msg = form.elements.message, counter = $('.counter', form);
    msg?.addEventListener('input', () => {
      const n = msg.value.length;
      counter.textContent = `${inr(n)} / 1,000`;
      counter.classList.toggle('is-shown', n >= 800);
      counter.classList.toggle('warn', n >= 950 && n < 1000);
      counter.classList.toggle('over', n >= 1000);
    });
    // Keep an unsent draft in this browser so a failed send never loses the message.
    const DRAFT = 'fp-enquiry-draft';
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (d) Object.entries(d).forEach(([k, v]) => { const el = form.elements[k]; if (el && v && !(k === 'interest' && qsInterest)) el.value = v; });
    } catch (_) {}
    form.addEventListener('input', () => {
      try { localStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(new FormData(form)))); } catch (_) {}
    });

    const live = $('.form-live', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const inputs = $$('input, select, textarea', form);
      const bad = inputs.filter(i => !check(i, true));
      if (bad.length) {
        live.textContent = `Please check ${bad.length} field${bad.length > 1 ? 's' : ''}.`;
        bad[0].focus();
        return;
      }
      const btn = $('button[type="submit"]', form);
      btn.style.width = btn.offsetWidth + 'px';
      btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true');
      // Frontend only: no backend yet. Simulate the request.
      setTimeout(() => {
        btn.classList.remove('is-loading'); btn.classList.add('is-done');
        setTimeout(() => {
          card.classList.add('is-success');
          try { localStorage.removeItem(DRAFT); } catch (_) {}
          const s = $('.success', card);
          s.setAttribute('tabindex', '-1'); s.focus({ preventScroll: true });
          if (!reduced()) confetti(card);
        }, 350);
      }, 1000);
    });
    $('[data-reset-form]', card)?.addEventListener('click', () => {
      form.reset(); card.classList.remove('is-success');
      const btn = $('button[type="submit"]', form); btn.classList.remove('is-done'); btn.style.width = '';
      setInterest(interestSelect.dataset.default, false);
    });
  }
  function confetti(host) {
    const box = document.createElement('div'); box.className = 'confetti';
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span');
      s.textContent = i % 2 ? '✓' : '₹';
      s.style.left = `${8 + Math.random() * 84}%`;
      s.style.color = ['#187A4F', '#F5B942', '#1B2A4E', '#2E4A8C'][i % 4];
      s.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      s.style.setProperty('--rot', `${(Math.random() - 0.5) * 540}deg`);
      s.style.animationDelay = `${Math.random() * 300}ms`;
      box.append(s);
    }
    host.append(box);
    setTimeout(() => box.remove(), 2000);
  }

  // Landing on /#section: jump there once layout and fonts have settled (smooth scroll can be cut short by late layout).
  if (location.hash.length > 1) addEventListener('load', () => {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    $$('.reveal:not(.is-in)').forEach(el => { if (el.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) el.classList.add('is-in'); });
    root.style.scrollBehavior = 'auto';
    t.scrollIntoView();
    root.style.scrollBehavior = '';
  });

  // Footer year
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
