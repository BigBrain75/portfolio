/* Интерактивные демо кейсов: Relay, Кадр/24, Chat Load Tester. */
'use strict';

/* ---------- RELAY demo ---------- */
(function(){
  const root = $('#relayDemo'); if (!root) return;
  const bars = $('#rlBars'), feed = $('#rlFeed'), elC = $('#rlClicks'), elL = $('#rlLive'), elB = $('#rlBots');
  const target = $('#rlTarget'), note = $('#rlNote'), link = $('#rlLink'), pauseBtn = $('#rlPause');
  const days = [612,548,806,742,931,688,1017,874,1126,983,1208,1069,1352,0];
  let clicks = 1284, bots = 283, paused = false, inView = false;
  days[13] = clicks;
  days.forEach(() => bars.appendChild(document.createElement('i')));
  function draw(){
    const M = Math.max(...days) * 1.08;
    Array.from(bars.children).forEach((b, i) => { b.style.height = (days[i] / M * 100) + '%'; });
    elC.textContent = fmt(clicks); elB.textContent = fmt(bots);
    elL.textContent = Math.round((clicks - bots) / clicks * 100) + '%';
  }
  const humans = [['RU','iPhone · Instagram'],['KZ','Android · Chrome'],['UZ','Android · TikTok'],['DE','Windows · Edge'],['BY','iPhone · Safari'],['TR','Android · Facebook'],['RU','Android · Telegram'],['AM','macOS · Chrome'],['UA','iPhone · Chrome'],['GE','Android · Samsung']];
  const robots = [['US','HeadlessChrome'],['NL','TelegramBot preview'],['IE','facebookexternalhit'],['US','python-requests'],['DE','AhrefsBot']];
  const pad = n => String(n).padStart(2, '0');
  const now = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  function row(isBot, anim){
    const [cc, dv] = (isBot ? robots : humans)[Math.random() * (isBot ? robots : humans).length | 0];
    const r = document.createElement('div'); r.className = 'fr' + (isBot ? ' bot' : '');
    if (!anim) r.style.animation = 'none';
    r.innerHTML = `<span class="tm">${now()}</span><span class="cc">${cc}</span><span class="dv">${esc(dv)}</span><span class="rs">${isBot ? '404' : (paused ? 'пауза' : '→ 302')}</span>`;
    feed.prepend(r);
    while (feed.children.length > 6) feed.lastChild.remove();
  }
  for (let i = 0; i < 6; i++) row(Math.random() < .25, false);
  draw();
  function tick(){
    if (inView && !paused){
      const isBot = Math.random() < .23;
      clicks++; if (isBot) bots++; days[13] = clicks;
      row(isBot, true); draw();
    }
    setTimeout(tick, 900 + Math.random() * 1300);
  }
  onView(root, v => inView = v);
  setTimeout(tick, 800);
  const offers = ['offer-alpha.com/?sub1=tg','offer-beta.app/?sub1=tg','promo-gamma.io/?sub1=tg'];
  let oi = 0, noteT;
  $('#rlSwap').addEventListener('click', () => {
    oi = (oi + 1) % offers.length; target.textContent = offers[oi];
    target.classList.add('flash'); setTimeout(() => target.classList.remove('flash'), 700);
    note.textContent = 'Ссылка та же. Трафик уже идёт на новый оффер.';
    clearTimeout(noteT); noteT = setTimeout(() => note.textContent = '', 3200);
  });
  pauseBtn.addEventListener('click', () => {
    paused = !paused; pauseBtn.setAttribute('aria-pressed', paused); pauseBtn.textContent = paused ? 'Включить' : 'Пауза';
    link.classList.toggle('paused', paused);
    note.textContent = paused ? 'Ссылка на паузе: переходы не уходят на оффер.' : 'Ссылка снова активна.';
    clearTimeout(noteT); noteT = setTimeout(() => note.textContent = '', 3200);
  });
})();

/* ---------- KADR/24 demo ---------- */
(function(){
  const root = $('#cinemaDemo'); if (!root) return;
  const sessWrap = $('#cnSess'), hall = $('#cnHall'), totalEl = $('#cnTotal'), pickedEl = $('#cnPicked'), buy = $('#cnBuy'), pop = $('#cnPop'), ticket = $('#cnTicket');
  const S = [{f:'Орбита', t:'19:40', h:'Зал 2', seed:41},{f:'Код Ариадны', t:'21:15', h:'Зал 1', seed:97},{f:'Глубина 4000', t:'22:30', h:'Зал 3', seed:173}];
  const ROWS = 6, SEATS = 12, LOVE = 5, P = 450, PL = 1100, POP = 390;
  const taken = {}; let cur = 0; const sel = new Set();
  const rng = seed => () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
  S.forEach((s, i) => {
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<b>${esc(s.f)}</b><span>${s.t} · ${s.h}</span>`;
    b.addEventListener('click', () => { cur = i; sel.clear(); build(); });
    sessWrap.appendChild(b);
  });
  function build(){
    Array.from(sessWrap.children).forEach((b, i) => { b.classList.toggle('on', i === cur); b.setAttribute('aria-pressed', i === cur); });
    if (!taken[cur]){
      const r = rng(S[cur].seed), set = new Set();
      for (let w = 0; w < 6; w++) r();
      for (let row = 1; row <= ROWS; row++) for (let s = 1; s <= SEATS; s++) if (r() < .32 + (row > 2 && row < 6 ? .12 : 0)) set.add(row + '-' + s);
      for (let s = 1; s <= LOVE; s++) if (r() < .4) set.add('L-' + s);
      taken[cur] = set;
    }
    hall.innerHTML = '';
    for (let row = 1; row <= ROWS + 1; row++){
      const isLove = row === ROWS + 1;
      const r = document.createElement('div'); r.className = 'cn-row';
      r.innerHTML = `<span class="rn">${isLove ? '♥' : row}</span>`;
      const n = isLove ? LOVE : SEATS;
      for (let s = 1; s <= n; s++){
        if (!isLove && (s === 4 || s === 10)){ const a = document.createElement('span'); a.className = 'aisle'; r.appendChild(a); }
        if (isLove && s > 1){ const a = document.createElement('span'); a.className = 'aisle'; a.style.width = '4px'; r.appendChild(a); }
        const id = (isLove ? 'L' : row) + '-' + s;
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'seat' + (isLove ? ' love' : '');
        b.dataset.id = id;
        b.setAttribute('aria-label', isLove ? `Диван для двоих ${s}` : `Ряд ${row}, место ${s}`);
        if (taken[cur].has(id)){ b.disabled = true; b.classList.add('taken'); }
        if (sel.has(id)) b.classList.add('sel');
        b.setAttribute('aria-pressed', sel.has(id));
        r.appendChild(b);
      }
      hall.appendChild(r);
    }
    sum();
  }
  hall.addEventListener('click', e => {
    const b = e.target.closest('button.seat'); if (!b || b.disabled) return;
    const id = b.dataset.id;
    if (sel.has(id)) sel.delete(id); else { if (sel.size >= 8){ toast('Не больше 8 мест в одном заказе'); return; } sel.add(id); }
    b.classList.toggle('sel', sel.has(id)); b.setAttribute('aria-pressed', sel.has(id));
    sum();
  });
  pop.addEventListener('change', sum);
  function describe(){
    const rows = {}; let love = [];
    [...sel].sort((a, b) => { const [ra, sa] = a.split('-'), [rb, sb] = b.split('-'); return (ra === 'L' ? 99 : +ra) - (rb === 'L' ? 99 : +rb) || sa - sb; })
      .forEach(id => { const [r, s] = id.split('-'); if (r === 'L') love.push(s); else (rows[r] = rows[r] || []).push(s); });
    const parts = Object.keys(rows).map(r => `ряд ${r}: ${rows[r].join(', ')}`);
    if (love.length) parts.push(`диван ${love.join(', ')}`);
    return parts.join(' · ');
  }
  function price(){ let t = 0; sel.forEach(id => t += id[0] === 'L' ? PL : P); if (sel.size && pop.checked) t += POP; return t; }
  function sum(){
    const t = price();
    totalEl.textContent = fmt(t) + ' ₽';
    if (!sel.size){ pickedEl.textContent = 'Выберите места на схеме'; buy.disabled = true; return; }
    const seats = [...sel].reduce((n, id) => n + (id[0] === 'L' ? 2 : 1), 0);
    pickedEl.textContent = `${seats} ${seats === 1 ? 'место' : seats < 5 ? 'места' : 'мест'} · ${describe()}`;
    buy.disabled = false;
  }
  buy.addEventListener('click', () => {
    const s = S[cur], code = 'K24-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    let qr = ''; const r = rng(code.charCodeAt(4) * 7919 + code.charCodeAt(6));
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++){
      const fin = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      const gap = (x === 3 && (y < 4 || y > 6)) || (y === 3 && (x < 4 || x > 6)) || (x === 7 && y < 4) || (y === 7 && x < 4);
      qr += `<i class="${fin ? '' : gap ? 'o' : (r() < .5 ? '' : 'o')}"></i>`;
    }
    ticket.innerHTML = `<div class="tk" role="document">
      <div class="tk-top"><small>Хорошего просмотра!</small><h4>${esc(s.f)}</h4><p>Сегодня, ${s.t} · ${s.h}</p><p>${esc(describe())}${pop.checked ? ' · попкорн' : ''}</p></div>
      <div class="tk-cut"></div>
      <div class="tk-bot"><div class="qr" aria-hidden="true">${qr}</div><div><b>${code}</b>Итого ${fmt(price())} ₽<br>Билет в «Мои билеты»</div></div>
      <button class="btn-sm tk-btn" type="button" id="cnDone">Готово</button></div>`;
    ticket.hidden = false; $('#cnDone').focus();
    $('#cnDone').addEventListener('click', () => {
      sel.forEach(id => taken[cur].add(id)); sel.clear(); pop.checked = false; ticket.hidden = true; build(); buy.focus();
    });
  });
  build();
})();

/* ---------- LOAD TEST demo ---------- */
(function(){
  const root = $('#ltDemo'); if (!root) return;
  const cv = $('#ltCanvas'), ctx = cv.getContext('2d'), logEl = $('#ltLog');
  const eA = $('#ltA'), eC = $('#ltC'), eR = $('#ltR'), eU = $('#ltU'), pill = $('#ltState');
  const TARGET = 500, ADD = 5, LIFE = 12;
  let st = 'idle', A = 0, C = 0, D = 0, R = 92, U = 0, hist = [], tick = 0, stopAt = 0, inView = false, started = false, timer = 0, reached = false;
  const pad = n => String(n).padStart(2, '0');
  const ts = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  const logs = [];
  function log(cls, msg){ logs.push(`<span>${ts()}</span> <span class="${cls}">${cls === 'w' ? 'WARN' : 'INFO'}</span> ${esc(msg)}`); while (logs.length > 4) logs.shift(); logEl.innerHTML = logs.join('\n'); }
  function setState(s, text){ st = s; pill.className = 'pill' + (s === 'run' ? ' run' : s === 'stop' ? ' stop' : ''); pill.textContent = text; }
  function start(){
    if (st === 'run') return;
    A = 0; C = 0; D = 0; hist = []; tick = 0; reached = false;
    setState('run', 'работает');
    log('i', 'start concurrency=500 rate=50/s target=mock:8765');
    if (!timer) loop();
  }
  function stop(){
    if (st !== 'run') return;
    setState('stop', 'останавливаю…'); stopAt = performance.now();
    log('w', 'SIGINT → graceful shutdown, закрываю ' + A + ' сессий');
  }
  function step(){
    tick++;
    if (st === 'run'){
      let cl = Math.max(0, Math.round(A * .1 / LIFE + (Math.random() - .5) * 2.2)); cl = Math.min(A, cl);
      A -= cl; D += cl;
      const add = Math.min(TARGET - A, ADD); A += add; C += add;
      const tgt = 104 + 9 * Math.sin(tick / 37) + Math.random() * 4;
      R += (tgt - R) * .08; U += ((15 + Math.random() * 20) - U) * .25;
      if (tick % 100 === 0){ R -= 4; log('g', 'gc.collect() pause=' + (40 + Math.random() * 9).toFixed(0) + 'ms rss=' + R.toFixed(0) + 'MB'); }
      else if (Math.random() < .05){
        const ev = [['i','session matched category=' + ['games','music','random','tech'][Math.random()*4|0]],['i','session closed reason=end lifetime=' + (6 + Math.random()*12).toFixed(1) + 's'],['i','session closed reason=inactivity'],['i','pool ' + A + '/500 → spawn replacement'],['w','handshake 503 → backoff ' + (0.4 + Math.random()).toFixed(2) + 's']];
        const e = ev[Math.random() * ev.length | 0]; log(e[0], e[1]);
      }
      if (A === TARGET && !reached){ reached = true; log('g', 'pool reached 500/500 · rss=' + R.toFixed(0) + 'MB'); }
    } else if (st === 'stop'){
      const cl = Math.min(A, Math.ceil(A * .38 + 6)); A -= cl; D += cl; U += (4 - U) * .3;
      if (A === 0){ const s = ((performance.now() - stopAt) / 1000).toFixed(2); setState('idle', 'остановлен за ' + s + ' с'); log('g', 'shutdown complete in ' + s + 's · created=' + C + ' done=' + D); }
    } else { U += (0 - U) * .3; R += (92 - R) * .04; }
    if (tick % 2 === 0){ hist.push({a:A, r:R}); if (hist.length > 140) hist.shift(); }
    eA.textContent = fmt(A); eC.textContent = fmt(C);
    eR.innerHTML = Math.round(R) + '<em>МБ</em>'; eU.innerHTML = Math.round(U) + '<em>%</em>';
    draw();
  }
  function loop(){ if (inView) step(); timer = setTimeout(loop, 100); }
  function draw(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const L = 34, Rr = 40, T = 26, B = 18, pw = w - L - Rr, ph = h - T - B;
    ctx.font = '10px "JetBrains Mono", monospace'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++){
      const y = T + ph - ph * i / 4;
      ctx.strokeStyle = 'rgba(110,145,255,.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, y + .5); ctx.lineTo(L + pw, y + .5); ctx.stroke();
      ctx.fillStyle = '#7d8ab0'; ctx.textAlign = 'right'; ctx.fillText(String(i * 125), L - 6, y);
      ctx.textAlign = 'left'; ctx.fillText(String(i * 50), L + pw + 6, y);
    }
    ctx.textAlign = 'left'; ctx.fillStyle = '#5fd4ff'; ctx.fillText('МБ', L + pw + 6, T - 12);
    ctx.fillStyle = '#7d8ab0'; ctx.textAlign = 'right'; ctx.fillText('сессии', L + 10, T - 12);
    if (hist.length < 2) return;
    const N = 140, x = i => L + pw * (i + (N - hist.length)) / (N - 1);
    const yA = v => T + ph - ph * v / 500, yR = v => T + ph - ph * v / 200;
    const g = ctx.createLinearGradient(0, T, 0, T + ph); g.addColorStop(0, 'rgba(61,123,255,.45)'); g.addColorStop(1, 'rgba(61,123,255,0)');
    ctx.beginPath(); ctx.moveTo(x(0), T + ph); hist.forEach((p, i) => ctx.lineTo(x(i), yA(p.a))); ctx.lineTo(x(hist.length - 1), T + ph); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); hist.forEach((p, i) => i ? ctx.lineTo(x(i), yA(p.a)) : ctx.moveTo(x(i), yA(p.a)));
    ctx.strokeStyle = '#3d7bff'; ctx.lineWidth = 2; ctx.shadowColor = '#3d7bff'; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.beginPath(); hist.forEach((p, i) => i ? ctx.lineTo(x(i), yR(p.r)) : ctx.moveTo(x(i), yR(p.r)));
    ctx.strokeStyle = '#5fd4ff'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
    const lp = hist[hist.length - 1], lx = x(hist.length - 1);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lx, yA(lp.a), 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#5fd4ff'; ctx.beginPath(); ctx.arc(lx, yR(lp.r), 3, 0, 7); ctx.fill();
  }
  $('#ltRun').addEventListener('click', start);
  $('#ltStop').addEventListener('click', stop);
  onView(root, v => { inView = v; if (v && !started){ started = true; start(); } }, {threshold:.3});
  if (!timer) loop();
  addEventListener('resize', draw);
  draw();
})();
