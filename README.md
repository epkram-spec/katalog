# Katalog

Веб-застосунок на `Next.js + TypeScript` для генерації PDF-каталогів з `Excel`, `CSV` або публічного `Google Sheets`.

## Що вміє зараз

- завантаження `.xlsx` і `.csv`
- імпорт із публічного `Google Sheets`
- ігнорування повністю порожніх рядків
- валідація `product_name`, `image_1` і URL у `image_1..image_3`
- показ помилок і warning-ів у UI
- 2 шаблони каталогу:
  - `Classic B2B`
  - `Minimal Modern`
- генерація PDF у форматі A4
- placeholder для фото, якщо зображення не завантажилось
- фінальна контактна сторінка
- опційна email-відправка PDF через SMTP

## Формат таблиці

Підтримувані колонки:

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
- будь-які колонки з префіксом `attr_`

Усі `attr_*` колонки автоматично стають таблицею характеристик товару.

## Google Sheets

Підтримуються лише публічні посилання на `docs.google.com`.

Приклади:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit?gid=123456
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID
```

Сервіс:

- дістає `spreadsheetId`
- якщо є `gid`, пробує взяти саме цей лист
- якщо `gid` немає, читає перший доступний лист

## Demo-файли

- `public/demo/catalog-demo.csv`
- `public/demo/catalog-demo.xlsx`

Щоб заново згенерувати `.xlsx`:

```bash
npm run demo:xlsx
```

## Локальний запуск

1. Відкрийте термінал у папці проєкту.
2. Встановіть залежності:

```bash
npm install
```

3. Створіть `.env.local` на основі прикладу:

```bash
cp .env.example .env.local
```

Для PowerShell:

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

- `SMTP_*`
  потрібні лише для надсилання PDF на email
- `CATALOG_CONTACT_*`
  використовуються на фінальній контактній сторінці PDF

## Де змінювати шаблони

Головна логіка генерації PDF:

- `src/lib/pdf.ts`

Головний UI:

- `src/components/catalog-generator.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

## Як завантажити на Vercel

### Варіант через сайт Vercel

1. Відкрийте [vercel.com](https://vercel.com/)
2. Натисніть `Log in`
3. Увійдіть через GitHub
4. Натисніть `Add New...`
5. Оберіть `Project`
6. Виберіть репозиторій `katalog`
7. Натисніть `Import`
8. У блоці `Environment Variables` додайте, якщо потрібна email-відправка:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
9. Якщо хочете свої контакти в PDF, додайте:
   - `CATALOG_CONTACT_COMPANY`
   - `CATALOG_CONTACT_PERSON`
   - `CATALOG_CONTACT_EMAIL`
   - `CATALOG_CONTACT_PHONE`
   - `CATALOG_CONTACT_WEBSITE`
10. Натисніть `Deploy`

Після деплою Vercel дасть тимчасовий домен виду:

```text
https://katalog-xxxxx.vercel.app
```

### Варіант через Vercel CLI

1. Встановіть CLI:

```bash
npm i -g vercel
```

2. Увійдіть:

```bash
vercel login
```

3. У папці проєкту виконайте:

```bash
vercel
```

4. Якщо потрібно одразу продакшн-посилання:

```bash
vercel --prod
```

## Що перевірити після деплою

- відкривається головна сторінка
- можна завантажити `xlsx` і отримати PDF
- можна вставити публічний `Google Sheets` link і отримати PDF
- при невалідній таблиці видно зрозумілі помилки
- працюють обидва шаблони
- demo-файл проходить генерацію без ручних змін
