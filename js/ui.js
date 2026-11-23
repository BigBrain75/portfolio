/* Интерфейс: навигация, анимации героя, счётчики, появление блоков, эффекты наведения. */
'use strict';

/* ---------- nav ---------- */
const nav = $('#nav'), prog = $('#prog');
function onScroll(){
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('scrolled', y > 8);
  prog.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
}
addEventListener('scroll', onScroll, {passive:true}); onScroll();
const burger = $('#burger');
burger.addEventListener('click', () => { const o = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); });
$$('#navLinks a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }));
if ('IntersectionObserver' in window){
  const links = $$('#navLinks a');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), {rootMargin:'-45% 0px -50% 0px'});
  $$('main section[id]').forEach(s => io.observe(s));
}

/* ---------- footer word ---------- */
(function(){
  const w = $('.foot-word'); if (!w) return;
  const light = () => w.classList.add('lit');
  w.addEventListener('pointerenter', light);
  w.addEventListener('click', light);
  onView(w, v => { if (!v) w.classList.remove('lit'); }, {threshold: 0});
})();

/* ---------- scramble ---------- */
const GLY = '!<>-_\\/[]{}=+*^?#01XZ';
function scramble(el, text, dur){
  if (RM) { el.textContent = text; return; }
  dur = dur || 1300;
  const n = text.length, start = performance.now();
  const at = Array.from(text, (_, i) => (i / n) * dur * .65 + Math.random() * dur * .35);
  if (el._scr) cancelAnimationFrame(el._scr);
  (function tick(now){
    const e = now - start; let out = '', done = true;
    for (let i = 0; i < n; i++){
      if (e >= at[i] || text[i] === ' ') out += esc(text[i]);
      else { done = false; out += '<span class="sc">' + esc(GLY[Math.random() * GLY.length | 0]) + '</span>'; }
    }
    el.innerHTML = out;
    el._scr = done ? 0 : requestAnimationFrame(tick);
  })(start);
}
const heroWord = $('#heroWord');
whenReady(() => scramble(heroWord, 'MARAKUYA', 1600));
$('#heroTitle').addEventListener('mouseenter', () => scramble(heroWord, 'MARAKUYA', 900));
$$('[data-scr]').forEach(el => {
  const txt = el.textContent; let did = false;
  onView(el, v => { if (v && !did){ did = true; scramble(el, txt, 900); } }, {threshold: 1});
});

/* ---------- rotating word ---------- */
(function(){
  const el = $('#rot');
  const words = ['сайты','интернет-магазины','Telegram-ботов','админ-панели','парсеры и софт','backend и API'];
  if (RM) return;
  let wi = 0;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  (async function loop(){
    await new Promise(r => whenReady(r));
    await sleep(2600);
    for(;;){
      const cur = el.textContent;
      for (let i = cur.length; i >= 0; i--){ el.textContent = cur.slice(0, i); await sleep(28); }
      wi = (wi + 1) % words.length; const w = words[wi];
      await sleep(180);
      for (let i = 1; i <= w.length; i++){ el.textContent = w.slice(0, i); await sleep(55 + Math.random() * 40); }
      await sleep(2000);
    }
  })();
})();

/* ---------- hero terminal ---------- */
(function(){
  const term = $('#term');
  const L = [
    ['cmd','whoami'],
    ['out','marakuya · cyber development studio','t-acc'],
    ['cmd','ls ~/portfolio'],
    ['out','pulse/  giftside/  relay/  kadr24/  chat-loadtest/','t-dim'],
    ['cmd','cd relay && php -S localhost:8000 index.php'],
    ['out','✓ sqlite     data/relay.sqlite','t-ok'],
    ['out','✓ telegram   уведомления о переходах','t-ok'],
    ['out','✓ filter     краулеры и превью → 404','t-ok'],
    ['cmd','python main.py --concurrency 500 --rate 50'],
    ['out','sessions 500/500 · rss 112 MB · cpu 24%','t-acc'],
    ['cmd','git push origin main'],
    ['out','→ исходники переданы заказчику ✓','t-ok']
  ];
  if (RM){
    term.innerHTML = L.map(([k,t,c]) => k === 'cmd' ? `<div class="l-cmd">${esc(t)}</div>` : `<div class="${c}">${esc(t)}</div>`).join('');
    return;
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const cursor = document.createElement('span'); cursor.className = 'cur';
  (async function run(){
    await new Promise(r => whenReady(r));
    for(;;){
      term.innerHTML = '';
      for (const [k, t, c] of L){
        const d = document.createElement('div');
        if (k === 'cmd'){
          d.className = 'l-cmd'; term.appendChild(d); d.appendChild(cursor);
          await sleep(380);
          for (let i = 1; i <= t.length; i++){ d.textContent = t.slice(0, i); d.appendChild(cursor); await sleep(26 + Math.random() * 45); }
          await sleep(320);
        } else {
          d.className = c; d.textContent = t; term.appendChild(d); await sleep(130);
        }
        term.scrollTop = term.scrollHeight;
      }
      const last = document.createElement('div'); last.className = 'l-cmd'; last.appendChild(cursor); term.appendChild(last);
      term.scrollTop = term.scrollHeight;
      await sleep(5200);
    }
  })();
})();

/* ---------- counters ---------- */
$$('[data-count]').forEach(el => {
  const to = +el.dataset.count, suf = el.dataset.suffix || ''; let did = false;
  if (RM) return;
  onView(el, v => {
    if (!v || did) return; did = true;
    whenReady(() => {
      const t0 = performance.now(), D = 1700;
      (function tick(now){ const k = Math.min(1, Math.max(0, now - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e) + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
    });
  }, {threshold: .6});
});

/* ---------- reveal ---------- */
(function(){
  if (RM || !('IntersectionObserver' in window)) return;
  const vh = innerHeight;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
  $$('.rv').forEach(el => { if (el.getBoundingClientRect().top > vh * .92){ el.classList.add('pre'); io.observe(el); } });
})();

/* ---------- spotlight + tilt + magnetic ---------- */
$$('.svc, .cc').forEach(el => el.addEventListener('pointermove', e => {
  const r = el.getBoundingClientRect(); el.style.setProperty('--x', (e.clientX - r.left) + 'px'); el.style.setProperty('--y', (e.clientY - r.top) + 'px');
}));
if (FINE && !RM){
  $$('.tilt').forEach(el => {
    const b = el.firstElementChild;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1300px) rotateX(${(.5 - py) * 7}deg) rotateY(${(px - .5) * 9}deg)`;
      b.style.setProperty('--gx', px * 100 + '%'); b.style.setProperty('--gy', py * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  $$('.mag').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .18}px,${(e.clientY - r.top - r.height/2) * .25}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- marquee duplication ---------- */
['#trackA','#trackB'].forEach(s => { const t = $(s); t.innerHTML += t.innerHTML; t.innerHTML += t.innerHTML; });

/* ---------- steps progress line ---------- */
(function(){
  const steps = $('#steps'), line = $('#stepsLine'); if (!steps || RM) return;
  function upd(){ const r = steps.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight * .8 - r.top) / (r.height + innerHeight * .25))); line.style.setProperty('--p', p.toFixed(3)); }
  addEventListener('scroll', upd, {passive:true}); upd();
})();

/* ---------- copy buttons ---------- */
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const ok = await copyText(b.dataset.copy);
  toast(ok ? 'Скопировано: ' + b.dataset.copy : b.dataset.copy);
}));
