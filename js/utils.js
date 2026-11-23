/* Общие помощники: селекторы, хранилище, форматирование, тосты, копирование. Подключается первым. */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
};
const fmt = n => Math.round(n).toLocaleString('ru-RU');
let FLASH = 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const onView = (el, cb, opts) => {
  if (!('IntersectionObserver' in window)) { cb(true); return; }
  new IntersectionObserver(es => es.forEach(e => cb(e.isIntersecting)), opts || {threshold: .15}).observe(el);
};

const whenReady = cb => document.documentElement.classList.contains('ready') ? cb() : addEventListener('site-ready', () => cb(), {once: true});

/* ---------- toast ---------- */
const toastEl = $('#toast'); let toastT;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2400); }
async function copyText(text, sourceEl){
  try { await navigator.clipboard.writeText(text); return true; }
  catch(e){
    if (sourceEl){ const r = document.createRange(); r.selectNodeContents(sourceEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    return false;
  }
}

/* ---------- preloader ---------- */
(function(){
  const root = document.documentElement, pl = $('#pl');
  const ready = () => { root.classList.remove('loading'); root.classList.add('ready'); dispatchEvent(new Event('site-ready')); };
  if (!pl){ ready(); return; }
  root.classList.add('loading');
  const bar = $('#plBar'), pct = $('#plPct'), msg = $('#plMsg');
  const D = RM ? 900 : 3300;
  const K = [[0,0],[.14,.18],[.26,.27],[.4,.46],[.55,.58],[.63,.61],[.8,.86],[.9,.93],[1,1]];
  const M = [[0,'инициализация ядра'],[.2,'подключаю WebGL'],[.42,'заряжаю молнии'],[.62,'собираю портфолио'],[.85,'полирую пиксели'],[1,'готово']];
  const curve = t => { for (let i = 1; i < K.length; i++) if (t <= K[i][0]){ const a = K[i-1], b = K[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); } return 1; };
  const t0 = performance.now(); let shown = '';
  function frame(now){
    const t = Math.min(1, (now - t0) / D); let p = curve(t);
    if (t >= 1 && document.readyState !== 'complete' && now - t0 < D + 4000) p = .99;
    bar.style.transform = `scaleX(${p})`; pct.textContent = Math.floor(p * 100) + '%';
    let m = ''; for (const [k, s] of M) if (p >= k) m = s;
    if (m !== shown){ shown = m; msg.textContent = m; }
    if (p < 1) requestAnimationFrame(frame); else finish();
  }
  function finish(){
    pl.classList.add('done'); FLASH = 1.2;
    setTimeout(() => { pl.classList.add('out'); ready(); }, 380);
    setTimeout(() => pl.remove(), 1200);
  }
  requestAnimationFrame(frame);
})();
