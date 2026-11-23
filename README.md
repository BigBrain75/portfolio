# MARAKUYA — сайт-портфолио

Одностраничный сайт студии **MARAKUYA · Cyber Development Studio**: услуги, стек, кейсы с живыми демо и конструктор заявки в Telegram.

Без сборки и зависимостей: чистые HTML, CSS и JavaScript.

## Запуск

Откройте папку в VS Code и запустите **Live Server** (правый клик по `index.html` → *Open with Live Server*).

Или без редактора:

```
python -m http.server 8000
```

→ http://localhost:8000

Можно открыть `index.html` двойным кликом, но только из этой папки: стили, скрипты и картинки подключаются из `css/`, `js/` и `img/`.

## Структура

```
index.html          разметка страницы
css/style.css       стили: токены цвета и шрифтов, секции, демо, адаптив
js/utils.js         общие помощники (подключается первым)
js/background.js    живой фон: WebGL-аврора, молнии с искрами, подсветка курсора
js/ui.js            навигация, анимации героя, счётчики, появление блоков
js/portfolio.js     модальные окна, скриншоты, описания кейсов, фильтры
js/demos.js         интерактивные демо: Relay, Кадр/24, Chat Load Tester
js/brief.js         конструктор заявки для Telegram
img/                скриншоты проектов и иконка
```

## Кейсы

| Проект | Что это | Стек |
|---|---|---|
| PULSE | Интернет-магазин спортивных товаров + админка | HTML, CSS, JS |
| GiftSide | Магазин подарочных карт и подписок | HTML, CSS, JS, Telegram Login |
| Relay | Короткие ссылки на своём домене | PHP 8, SQLite |
| Кадр/24 | Расписание кино и онлайн-бронирование | HTML, CSS, JS |
| Chat Load Tester | 500 параллельных чат-сессий на слабом VPS | Python, asyncio, aiohttp |

Новый кейс добавляется блоком `<article class="case">` в `index.html` и описанием в объекте `CASES` в `js/portfolio.js`.

## Отправить одним файлом

`index.html` из этой папки работает только вместе с `css/`, `js/` и `img/`. Чтобы отправить портфолио в Telegram, Discord или почту, соберите один файл, в который всё встроено:

```
powershell -ExecutionPolicy Bypass -File build.ps1
```

В VS Code то же самое: `Ctrl+Shift+B`. Готовый файл появится в `dist/marakuya-portfolio.html`, отправляйте его.

## Публикация

Загрузите **всю папку** на любой статический хостинг: GitHub Pages, Netlify, Vercel или обычный хостинг через FTP.

## Контакты

Telegram: [@yeah_buddddy](https://t.me/yeah_buddddy)
