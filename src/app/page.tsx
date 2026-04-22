import Link from "next/link";

import { CatalogGenerator } from "@/components/catalog-generator";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero__copy">
          <div className="hero__topline">
            <span className="eyebrow">Katalog</span>
            <Link className="subtle-link" href="/instructions">
              Інструкції
            </Link>
          </div>
          <h1>Зберіть охайний PDF-каталог з таблиці без зайвих кроків.</h1>
          <p>
            Завантажте Excel, CSV або вставте публічне посилання на Google
            Sheets. Сервіс перевірить дані, оформить каталог у вибраному стилі та
            підготує PDF для завантаження.
          </p>
          <div className="hero__meta">
            <span>2 стилі оформлення</span>
            <span>Підготовлено для A4</span>
            <span>Швидкий старт з demo-файлом</span>
          </div>
        </div>
        <div className="hero__card">
          <p>Що знадобиться в таблиці</p>
          <ul>
            <li>
              Назва товару в <code>product_name</code>
            </li>
            <li>
              Головне фото в <code>image_1</code>
            </li>
            <li>
              Додаткові поля: <code>sku</code>, <code>brand</code>,{" "}
              <code>category</code>, <code>price</code>
            </li>
            <li>
              Характеристики через колонки <code>attr_*</code>
            </li>
          </ul>
        </div>
      </section>

      <CatalogGenerator />
    </main>
  );
}
