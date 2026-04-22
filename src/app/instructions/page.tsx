export default function InstructionsPage() {
  return (
    <main className="shell shell--narrow">
      <section className="panel panel--stack">
        <div>
          <span className="eyebrow">Інструкції</span>
          <h1 className="page-title">Як підготувати таблицю для каталогу</h1>
          <p className="section-copy">
            Тут зібрані лише підказки по структурі таблиці, формату даних і швидкому старту.
            Головна сторінка лишається чистою та зосередженою на генерації PDF.
          </p>
        </div>

        <div className="divider" />

        <div>
          <h2>Обов&apos;язкові колонки</h2>
          <ul className="feature-list">
            <li>
              <code>product_name</code>
            </li>
            <li>
              <code>image_1</code>
            </li>
          </ul>
        </div>

        <div>
          <h2>Рекомендовані колонки</h2>
          <ul className="feature-list">
            <li>
              <code>sku</code>, <code>brand</code>, <code>category</code>
            </li>
            <li>
              <code>short_description</code>, <code>description</code>, <code>price</code>
            </li>
            <li>
              <code>image_2</code>, <code>image_3</code>, <code>order</code>
            </li>
            <li>
              будь-які характеристики з префіксом <code>attr_</code>
            </li>
          </ul>
        </div>

        <div>
          <h2>Google Sheets</h2>
          <p className="section-copy">
            Працюють лише публічні посилання на Google Sheets. Якщо в URL є <code>gid</code>,
            сервіс спробує використати саме цей лист.
          </p>
        </div>

        <div>
          <h2>Demo-файли</h2>
          <div className="demo-links">
            <a href="/demo/catalog-demo.csv" download>
              CSV demo
            </a>
            <a href="/demo/catalog-demo.xlsx" download>
              XLSX demo
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
