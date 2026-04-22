import { CatalogGenerator } from "@/components/catalog-generator";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">PDF catalog studio</span>
          <h1>Перетворюйте таблиці на акуратні PDF-каталоги за кілька хвилин.</h1>
          <p>
            Завантажте Excel або CSV, або вставте посилання на Google Sheets.
            Система перевірить дані, збере каталог і збереже готовий PDF для
            завантаження чи відправки на email.
          </p>
          <div className="hero__meta">
            <span>Без авторизації</span>
            <span>Без бази даних</span>
            <span>Мінімалістичний інтерфейс</span>
          </div>
        </div>
        <div className="hero__card">
          <p>Очікувані колонки</p>
          <ul>
            <li>`product_name`, `sku`, `brand`, `category`</li>
            <li>`short_description`, `description`, `price`</li>
            <li>`image_1`, `image_2`, `image_3`, `order`</li>
            <li>Будь-які характеристики з префіксом `attr_`</li>
          </ul>
        </div>
      </section>

      <CatalogGenerator />
    </main>
  );
}
