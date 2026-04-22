import { CatalogGenerator } from "@/components/catalog-generator";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">PDF catalog studio</span>
          <h1>Перетворюйте таблиці на акуратні PDF-каталоги за кілька хвилин.</h1>
          <p>
            Завантажте Excel або CSV, або вставте публічне посилання на Google
            Sheets. Система перевірить дані, покаже помилки й warning-и,
            згенерує каталог у вибраному стилі та поверне готовий PDF.
          </p>
          <div className="hero__meta">
            <span>Без авторизації</span>
            <span>Без бази даних</span>
            <span>Підходить для A4</span>
          </div>
        </div>
        <div className="hero__card">
          <p>Очікувані колонки</p>
          <ul>
            <li>
              <code>product_name</code>, <code>sku</code>, <code>brand</code>,{" "}
              <code>category</code>
            </li>
            <li>
              <code>short_description</code>, <code>description</code>,{" "}
              <code>price</code>
            </li>
            <li>
              <code>image_1</code>, <code>image_2</code>, <code>image_3</code>,{" "}
              <code>order</code>
            </li>
            <li>
              Будь-які характеристики з префіксом <code>attr_</code>
            </li>
          </ul>
        </div>
      </section>

      <CatalogGenerator />
    </main>
  );
}
