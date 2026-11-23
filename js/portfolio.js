/* Портфолио: модальные окна, просмотр скриншотов, описания кейсов, фильтры. */
'use strict';

/* ---------- overlay (modal + lightbox) ---------- */
let ovEl = null, lastFocus = null;
function openOverlay(inner, cls){
  closeOverlay(true);
  lastFocus = document.activeElement;
  ovEl = document.createElement('div'); ovEl.className = 'ov';
  ovEl.setAttribute('role', 'dialog'); ovEl.setAttribute('aria-modal', 'true');
  ovEl.innerHTML = `<div class="ov-panel ${cls || ''}"><button class="ov-x" type="button" aria-label="Закрыть"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>${inner}</div>`;
  document.body.appendChild(ovEl);
  document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => ovEl.classList.add('show'));
  ovEl.addEventListener('click', e => { if (e.target === ovEl || e.target.closest('.ov-x')) closeOverlay(); });
  $('.ov-x', ovEl).focus();
}
function closeOverlay(instant){
  if (!ovEl) return;
  const el = ovEl; ovEl = null;
  document.documentElement.style.overflow = '';
  if (instant) el.remove(); else { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (ovEl) closeOverlay(); document.body.classList.remove('menu-open'); }
  if (e.key === 'Tab' && ovEl){
    const f = $$('button, a[href], input, select, textarea', ovEl); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
});

/* ---------- screenshot browsers ---------- */
$$('[data-shots]').forEach(b => {
  const imgs = $$('.b-view img', b), tabs = $$('.b-tabs button', b), url = $('.b-url', b), bar = $('.b-prog', b), view = $('.b-view', b);
  let i = 0, inView = false;
  function show(k){
    i = k;
    imgs.forEach((im, j) => im.classList.toggle('on', j === k));
    tabs.forEach((t, j) => { t.classList.toggle('on', j === k); t.setAttribute('aria-selected', j === k); });
    url.textContent = tabs[k].dataset.url;
    bar.classList.remove('run'); void bar.offsetWidth;
    if (!RM && inView) bar.classList.add('run');
  }
  bar.addEventListener('animationend', () => show((i + 1) % imgs.length));
  tabs.forEach((t, j) => t.addEventListener('click', () => show(j)));
  view.addEventListener('click', () => openOverlay(`<img src="${imgs[i].getAttribute('src')}" alt="${esc(imgs[i].alt)}">`, 'img'));
  onView(b, v => { inView = v; if (v && !bar.classList.contains('run') && !RM) bar.classList.add('run'); if (!v) bar.classList.remove('run'); }, {threshold:.35});
  show(0);
});

/* ---------- case details ---------- */
const CASES = {
  pulse: {
    name:'PULSE', badge:'свой проект', title:'Интернет-магазин спортивных товаров + админ-панель',
    lead:'Статический сайт без сборки на HTML, CSS и чистом JavaScript. Товары, заказы и настройки общие для магазина и админки: изменения в одной вкладке сразу видны в другой.',
    boxes:[
      ['Магазин',['Главный экран: категории, слайдер хитов, акция с таймером, бегущая строка','Каталог: фильтры по категории, цене, бренду, скидке, новинкам, наличию и рейтингу; 6 видов сортировки и «Показать ещё»','Живой поиск с подсветкой и навигацией стрелками','Карточка товара: цвет, размер, количество, характеристики, отзывы, ссылка вида #product/p1','Корзина: промокоды, прогресс до бесплатной доставки, проверка остатков','Оформление заказа с валидацией и маской телефона, отслеживание по номеру','Избранное, «Вы смотрели», светлая и тёмная тема, адаптив']],
      ['Админка',['Дашборд: выручка, заказы, средний чек со сравнением с прошлым периодом, график по дням, продажи по категориям, топ товаров, заканчивающиеся остатки','Заказы: фильтр по статусам, поиск, сортировка, смена статуса; отмена возвращает товар на склад; экспорт CSV','Товары: создание, редактирование, копирование, удаление, загрузка фото, скрытие с сайта','Категории, промокоды, отзывы, клиенты и подписчики','Настройки магазина, смена пароля, экспорт и импорт JSON, сброс к демо-данным']]
    ],
    chips:['HTML','CSS','JavaScript','localStorage'],
    note:'Демо-проект: авторизация и хранение работают в браузере. Для боевого магазина подключается сервер с базой данных.'
  },
  giftside: {
    name:'GIFTSIDE', badge:'заказ клиента', title:'Магазин подарочных карт, подписок и пополнений',
    lead:'Сервис, где можно оплатить зарубежные игры, музыку, кино и нейросети картой РФ или через СБП. Код или пополнение приходит на почту и в Telegram.',
    boxes:[
      ['Витрина',['Steam, PlayStation Store, Xbox, Nintendo eShop, Discord Nitro, Spotify, Apple Music, Netflix, YouTube Premium, ChatGPT Plus, Midjourney, App Store','Категории: игры, музыка, кино и видео, нейросети, магазины приложений','Поиск по сервисам прямо из шапки','Бейджи типа товара: карта, подписка, пополнение']],
      ['Покупка и аккаунт',['Страница товара с выбором номинала и региона','Своя сумма пополнения с расчётом комиссии','Оформление заказа и история заказов','Вход через Telegram и связка с Telegram-ботом','Блоки «Как это работает», вопросы и поддержка']]
    ],
    chips:['HTML','CSS','JavaScript','Telegram Login'],
    note:'Страницы: витрина, карточка товара, история заказов.'
  },
  relay: {
    name:'RELAY', badge:'заказ клиента', title:'Короткие ссылки на своём домене',
    lead:'Арбитражник льёт трафик на оффер, а домен оффера блокируют, и трафик сгорает. С Relay трафик идёт через короткую ссылку вида your-short.com/abc: оффер забанили, меняете URL в админке, а ссылка продолжает работать.',
    boxes:[
      ['Возможности',['Ставится на любой хостинг с PHP, без сторонних сервисов','Создать, изменить, сменить оффер, поставить на паузу, удалить в один клик','Фильтр ботов по User-Agent: краулеры, превью мессенджеров, парсеры и headless-браузеры получают 404 или «белую» страницу','Передача параметров: /abc?sub1=x → offer.com/?sub1=x','Редирект отдаётся мгновенно, статистика и Telegram обрабатываются после ответа']],
      ['Аналитика',['Уведомления в Telegram о каждом переходе: IP, страна, город, провайдер, устройство, ОС, браузер (включая in-app Instagram, Facebook, TikTok), язык, источник','График за 14 дней, страны, устройства','Журнал всех кликов с фильтрами','Гео через ip-api.com или заголовок CF-IPCountry за Cloudflare','Тёмная и светлая тема, адаптивная вёрстка']],
      ['Развёртывание',['PHP 8.0+ с pdo_sqlite, Apache с mod_rewrite или nginx + PHP-FPM','Свой адрес панели в config.php, пароль задаётся при первом входе','Бэкап: просто копия файла data/relay.sqlite'],'wide']
    ],
    chips:['PHP 8','SQLite','Apache','nginx','Telegram Bot API']
  },
  kadr24: {
    name:'КАДР/24', badge:'веб-сервис', title:'Расписание сеансов и онлайн-бронирование билетов',
    lead:'Одностраничный сайт кинотеатра, который проводит зрителя от афиши до билета без перезагрузок страницы.',
    boxes:[
      ['Афиша',['Расписание сеансов с фильтрами и сбросом фильтров','Подсказка, когда сеансы на сегодня закончились, с переходом на завтра','«Скоро в прокате» и список ожидания «Жду премьеру»']],
      ['Покупка',['Выбор сеанса и мест на схеме зала, включая диваны для двоих','«Кто идёт в кино»: билеты по категориям','Бар: попкорн и напитки к заказу','Контакты и оплата картой или наличными на кассе']],
      ['После покупки',['Раздел «Мои билеты»','Отмена брони или возврат билетов с подтверждением прямо на странице'],'wide']
    ],
    chips:['HTML','CSS','JavaScript','SPA']
  },
  loadtest: {
    name:'CHAT LOAD TESTER', badge:'python · asyncio', title:'Асинхронный менеджер сотен параллельных чат-сессий',
    lead:'Нагрузочный эксперимент на слабом VPS (1–2 ГБ RAM) против собственного mock-сервиса. Подключения разрешены только к хостам из белого списка конфигурации.',
    table:[['Одновременных сессий','500, держится ровно'],['Создано / завершено за 90 с','5 335 / 4 836'],['RSS менеджера','100–120 МБ, без роста'],['CPU','15–35 % одного ядра'],['SIGINT → полная остановка','< 1 с']],
    boxes:[
      ['Почему это лёгкое',['Одна корутина на сессию, без потоков и процессов на соединение','Общий ClientSession и TCPConnector с общим DNS-кэшем','permessage-deflate выключен: zlib-контекст стоит сотни КБ на соединение','__slots__ у сессии, статистика только счётчиками','Логи пишутся в отдельном потоке через очередь','gc.freeze() после старта и плановая gc.collect(); uvloop на Linux']],
      ['Надёжность',['Жизнь сессии: CONNECTING → ACTIVE → WAITING → CLOSING','Semaphore, очередь, TokenBucket и backoff с jitter','Недоступный сервер → backoff и /health = 503, после подъёма пул сам восстанавливается','Агрегированные отчёты в Telegram с обработкой 429','Mock-сервер эмулирует задержки, обрывы, отказы и «зависших» собеседников']]
    ],
    chips:['Python','asyncio','aiohttp','uvloop','Docker','systemd'],
    note:'Без плановой сборки мусора RSS в тесте рос с 92 до 243 МБ за 45 секунд. С gc_interval 10 с память держится ровно, пауза сборки около 45 мс.'
  }
};
function caseHTML(k){
  const c = CASES[k];
  const boxes = c.boxes.map(([h, items, wide]) => `<div class="md-box ${wide || ''}"><h3>${esc(h)}</h3><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
  const table = c.table ? `<div class="md-box wide"><h3>Результаты проверки · 500 сессий</h3><table>${c.table.map(([a,b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table></div>` : '';
  return `<div class="md"><div class="case-meta"><span class="case-name">${esc(c.name)}</span><span class="badge">${esc(c.badge)}</span></div>
    <h2 id="mdTitle">${esc(c.title)}</h2><p>${esc(c.lead)}</p>
    <div class="md-grid">${table}${boxes}</div>
    <div class="chips">${c.chips.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>
    ${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}</div>`;
}
$$('[data-open]').forEach(b => b.addEventListener('click', () => { openOverlay(caseHTML(b.dataset.open)); ovEl.setAttribute('aria-labelledby', 'mdTitle'); }));

/* ---------- filters ---------- */
(function(){
  const cases = $$('.case'), filters = $$('.filter');
  filters.forEach(f => { const k = f.dataset.f; $('b', f).textContent = k === 'all' ? cases.length : cases.filter(c => c.dataset.tags.split(' ').includes(k)).length; });
  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(x => { x.classList.toggle('on', x === f); x.setAttribute('aria-pressed', x === f); });
    const k = f.dataset.f; let vis = 0;
    cases.forEach(c => {
      const show = k === 'all' || c.dataset.tags.split(' ').includes(k);
      if (show){
        c.classList.toggle('flip', vis % 2 === 1); vis++;
        c.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('out')));
      } else {
        c.classList.add('out'); setTimeout(() => { if (c.classList.contains('out')) c.hidden = true; }, 380);
      }
    });
  }));
})();
