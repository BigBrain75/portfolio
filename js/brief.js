/* Конструктор заявки: собирает сообщение для Telegram и сохраняет черновик. */
'use strict';

/* ---------- brief builder ---------- */
(function(){
  const form = $('#briefForm'), out = $('#bOut');
  const kinds = $$('#bKinds input'), fn = $('#bFunc'), ref = $('#bRef'), time = $('#bTime'), budget = $('#bBudget');
  const KEY = 'marakuya-brief';
  try {
    const d = JSON.parse(store.get(KEY) || 'null');
    if (d){ kinds.forEach(k => k.checked = (d.k || []).includes(k.value)); fn.value = d.f || ''; ref.value = d.r || ''; time.value = d.t || ''; budget.value = d.b || ''; }
  } catch(e){}
  function data(){ return { k: kinds.filter(k => k.checked).map(k => k.value), f: fn.value.trim(), r: ref.value.trim(), t: time.value, b: budget.value.trim() }; }
  function plain(){
    const d = data();
    return ['Привет! Хочу заказать разработку.', '',
      '01 ▸ Что нужно: ' + (d.k.join(', ') || '—'),
      '02 ▸ Функционал: ' + (d.f || '—'),
      '03 ▸ Референсы: ' + (d.r || 'нет'),
      '04 ▸ Сроки и бюджет: ' + (d.t || 'обсудим') + ' · ' + (d.b || 'обсудим')].join('\n');
  }
  function render(){
    const d = data(), ph = s => `<span class="ph">${s}</span>`;
    out.innerHTML = ['Привет! Хочу заказать разработку.', '',
      '01 ▸ Что нужно: ' + (d.k.length ? esc(d.k.join(', ')) : ph('отметьте слева')),
      '02 ▸ Функционал: ' + (d.f ? esc(d.f) : ph('опишите задачу')),
      '03 ▸ Референсы: ' + (d.r ? esc(d.r) : ph('нет')),
      '04 ▸ Сроки и бюджет: ' + esc(d.t || 'обсудим') + ' · ' + (d.b ? esc(d.b) : ph('обсудим'))].join('\n');
    const n = new Date(); out.dataset.time = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
    store.set(KEY, JSON.stringify(d));
  }
  form.addEventListener('input', render); form.addEventListener('change', render);
  form.addEventListener('submit', e => e.preventDefault());
  render();
  async function doCopy(){
    const ok = await copyText(plain(), out);
    toast(ok ? 'Заявка скопирована' : 'Текст выделен: нажмите Ctrl+C');
  }
  $('#bCopy').addEventListener('click', doCopy);
  $('#bSend').addEventListener('click', () => { doCopy(); });
})();
