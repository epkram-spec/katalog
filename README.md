# Katalog

Веб-застосунок на `Next.js + TypeScript` для генерації PDF-каталогів з `Excel`, `CSV` або публічного `Google Sheets`.

## Що вже реалізовано

- Завантаження `.xlsx` або `.csv`
- Імпорт з публічного `Google Sheets`
- Ігнорування повністю порожніх рядків
- Валідація:
  - `product_name` обов’язковий
  - `image_1` обов’язковий
  - `image_1..image_3` мають бути валідними URL
- Warning-и в UI для необов’язкових, але бажаних полів
- 2 шаблони каталогу:
  - `Classic B2B`
  - `Minimal Modern`
- PDF містить:
  - обкладинку
  - список товарів
  - сторінки товарів
  - фінальну контактну сторінку
- Placeholder для зображень, якщо картинка не завантажилась
- Тимчасове зберігання PDF у `tmp/generated`
- Download link для готового PDF
- Опційна email-відправка через SMTP

## Технології

- `Next.js 16`
- `TypeScript`
- `server route handlers`
- `Puppeteer`
- `@sparticuz/chromium` для Vercel
- `xlsx`
- `nodemailer`
- `zod`

## Формат таблиці

### Підтримувані колонки

- `product_name` `required`
- `sku`
- `brand`
- `category`
- `short_description`
- `description`
- `price`
- `image_1` `required`
- `image_2`
- `image_3`
- `order`
- будь-які колонки, що починаються з `attr_`

### Як працюють `attr_*`

Усі колонки з префіксом `attr_` автоматично потрапляють у таблицю характеристик товару.

Приклади:

- `attr_color`
- `attr_material`
- `attr_size`
- `attr_warranty`

## Google Sheets

Підтримуються лише публічні посилання на `docs.google.com`.

Приклади:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit?gid=123456
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID
```

Що робить застосунок:

- дістає `spreadsheetId`
- якщо в URL є `gid`, читає саме цей лист
- якщо `gid` немає, пробує CSV export для першого доступного листа

## Demo-файли

У репозиторії є готові demo-файли з 5 товарами:

- `public/demo/catalog-demo.csv`
- `public/demo/catalog-demo.xlsx`

Щоб згенерувати `xlsx` повторно:

```bash
npm run demo:xlsx
```

## Локальний запуск

1. Відкрийте термінал у папці проєкту.
2. Встановіть залежності:

```bash
npm install
```

3. Створіть файл `.env.local` на основі прикладу:

```bash
cp .env.example .env.local
```

Для Windows PowerShell можна так:

```powershell
Copy-Item .env.example .env.local
```

4. Запустіть проєкт:

```bash
npm run dev
```

5. Відкрийте:

```text
http://localhost:3000
```

## Змінні середовища

```env
PDF_TTL_MINUTES=60
DELETE_PDF_AFTER_EMAIL=false

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

CATALOG_CONTACT_COMPANY=Your Company
CATALOG_CONTACT_PERSON=Sales Team
CATALOG_CONTACT_EMAIL=sales@example.com
CATALOG_CONTACT_PHONE=+380 00 000 00 00
CATALOG_CONTACT_WEBSITE=https://example.com
```

### Для чого вони потрібні

- `PDF_TTL_MINUTES`
  Час життя тимчасового PDF
- `DELETE_PDF_AFTER_EMAIL`
  Якщо `true`, файл видаляється після успішної email-відправки
- `SMTP_*`
  Потрібні лише для надсилання PDF на email
- `CATALOG_CONTACT_*`
  Дані для фінальної контактної сторінки PDF

## Де змінювати шаблони

Основний файл шаблонів:

- `src/lib/html-template.ts`

Там змінюються:

- стилі `Classic B2B`
- стилі `Minimal Modern`
- обкладинка
- сторінка товару
- контактна сторінка
- placeholder для відсутніх зображень

## Де зберігається PDF

Тимчасові файли потрапляють у:

```text
tmp/generated
```

Старі PDF очищаються автоматично при наступних генераціях.

## Чому GitHub Pages не підходить

GitHub Pages вміє показувати лише статичні файли.

А цей проєкт використовує:

- серверні API routes
- генерацію PDF через Node.js
- тимчасове файлове сховище
- SMTP email-відправку

Тому для хостингу використовуйте `Vercel`, а не GitHub Pages.

## Як завантажити на Vercel дуже просто

Офіційні джерела:

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)

### Варіант 1. Через сайт Vercel

1. Відкрийте [vercel.com](https://vercel.com/)
2. Натисніть `Sign up` або `Log in`
3. Увійдіть через GitHub
4. Натисніть `Add New...`
5. Оберіть `Project`
6. Виберіть репозиторій `katalog`
7. Натисніть `Import`
8. Нічого складного не міняйте
9. Якщо хочете, одразу додайте Environment Variables:
   - `PDF_TTL_MINUTES`
   - `DELETE_PDF_AFTER_EMAIL`
   - `PUPPETEER_SKIP_DOWNLOAD=true`
   - `SMTP_*` якщо потрібна email-відправка
   - `CATALOG_CONTACT_*` для контактної сторінки
10. Натисніть `Deploy`

Після цього Vercel сам дасть тимчасовий домен приблизно такого виду:

```text
https://katalog-xxxxx.vercel.app
```

### Варіант 2. Через Vercel CLI

1. Встановіть CLI:

```bash
npm i -g vercel
```

2. Увійдіть:

```bash
vercel login
```

3. У папці проєкту запустіть:

```bash
vercel
```

4. Відповідайте просто:
   - `Set up and deploy?` -> `Y`
   - `Which scope?` -> оберіть свій акаунт
   - `Link to existing project?` -> `N`, якщо проєкту ще нема
   - `Project name?` -> `katalog`
   - `In which directory is your code located?` -> натисніть `Enter`

5. Після завершення CLI покаже тимчасовий домен `*.vercel.app`

Перед деплоєм на Vercel додайте в Environment Variables:

```text
PUPPETEER_SKIP_DOWNLOAD=true
```

### Якщо треба продакшн-деплой

```bash
vercel --prod
```

## Критерії готовності

- Можна завантажити `xlsx` і отримати PDF
- Можна вставити публічний `Google Sheets` link і отримати PDF
- При невалідній таблиці видно зрозумілі помилки
- PDF містить фото, назви, описи і характеристики
- Є 2 шаблони оформлення
- Є demo-файл для перевірки
- Проєкт готовий до деплою на Vercel
