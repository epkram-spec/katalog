# Katalog

Мінімалістичний веб-застосунок на `Next.js + TypeScript` для генерації PDF-каталогів із `Excel`, `CSV` або `Google Sheets`.

## Що вміє MVP

- Завантаження `.xlsx` або `.csv`.
- Імпорт із публічного `Google Sheets` за посиланням.
- Перетворення кожного рядка таблиці на товар.
- Підтримка базових колонок:
  - `product_name`, `sku`, `brand`, `category`
  - `short_description`, `description`, `price`
  - `image_1`, `image_2`, `image_3`, `order`
  - будь-які характеристики з префіксом `attr_`
- Валідація:
  - обов'язковий `product_name`
  - обов'язковий `image_1`
  - перевірка URL у `image_1..image_3`
- Генерація HTML-каталогу з:
  - обкладинкою
  - списком товарів
  - сторінками товарів
  - таблицею характеристик
- Генерація PDF через `Playwright`.
- Тимчасове зберігання PDF у `tmp/generated`.
- Опційна відправка PDF на email через SMTP.
- Автоочистка старих PDF за TTL.

## Технології

- `Next.js 16`
- `TypeScript`
- `Playwright`
- `xlsx`
- `nodemailer`
- `zod`

## Швидкий старт

1. Встановіть залежності:

```bash
npm install
```

2. Встановіть Chromium для Playwright:

```bash
npm run playwright:install
```

3. Створіть локальний env-файл:

```bash
cp .env.example .env.local
```

4. Запустіть dev-сервер:

```bash
npm run dev
```

5. Відкрийте [http://localhost:3000](http://localhost:3000)

## Налаштування email

Щоб відправляти PDF на email, заповніть у `.env.local`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mailer@example.com
SMTP_PASS=your-password
SMTP_FROM=Catalog Bot <mailer@example.com>
```

### Додаткові параметри

```env
PDF_TTL_MINUTES=60
DELETE_PDF_AFTER_EMAIL=false
```

- `PDF_TTL_MINUTES` визначає, скільки хвилин PDF зберігається у `public/generated`.
- `DELETE_PDF_AFTER_EMAIL=true` видаляє файл одразу після успішної email-відправки.

## Формат таблиці

### Обов'язкові колонки

- `product_name`
- `image_1`

### Рекомендовані колонки

- `sku`
- `brand`
- `category`
- `short_description`
- `description`
- `price`
- `image_2`
- `image_3`
- `order`

### Характеристики

Будь-яка колонка, що починається з `attr_`, потрапить у таблицю характеристик.

Приклади:

- `attr_color`
- `attr_material`
- `attr_size`
- `attr_warranty`

## Google Sheets

MVP підтримує лише публічні Google Sheets без авторизації.

Підійдуть стандартні посилання виду:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
```

Застосунок автоматично перетворює їх у CSV export URL.

## Demo-файли

У репозиторії є приклади з 5 товарами:

- `public/demo/catalog-demo.csv`
- `public/demo/catalog-demo.xlsx`

Щоб згенерувати XLSX заново:

```bash
npm run demo:xlsx
```

## Де зберігається PDF

Готові PDF потрапляють у:

```text
tmp/generated
```

Файли очищаються автоматично при наступних генераціях, якщо їхній вік перевищив `PDF_TTL_MINUTES`.

## Архітектура

```text
src/
  app/
    api/catalog/generate/route.ts
    layout.tsx
    page.tsx
  components/
    catalog-generator.tsx
  lib/
    catalog.ts
    config.ts
    email.ts
    google-sheets.ts
    html-template.ts
    pdf.ts
    storage.ts
    types.ts
public/
  demo/
tmp/
  generated/
scripts/
  create-demo-xlsx.mjs
```

## Обмеження MVP

- Без авторизації.
- Без бази даних.
- Без історії генерацій.
- Google Sheets працює лише для публічних таблиць.
- Тимчасове зберігання PDF локальне, що підходить для MVP або self-hosted запуску.
