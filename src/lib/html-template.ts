import type { CatalogProduct } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPrice(value: string) {
  if (!value) {
    return "За запитом";
  }

  const parsed = Number(value.replaceAll(/\s/g, "").replace(",", "."));

  if (!Number.isFinite(parsed)) {
    return escapeHtml(value);
  }

  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(parsed);
}

function renderSummary(products: CatalogProduct[]) {
  return products
    .map(
      (product, index) => `
        <li>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(product.productName)}</strong>
          <small>${escapeHtml(product.brand || product.category || "Товар")}</small>
        </li>
      `,
    )
    .join("");
}

function renderProduct(product: CatalogProduct, index: number) {
  const gallery = product.images
    .map(
      (image, imageIndex) => `
        <figure class="${imageIndex === 0 ? "hero-image" : "thumb-image"}">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(product.productName)}" />
        </figure>
      `,
    )
    .join("");

  const specs = product.attributes.length
    ? product.attributes
        .map(
          (attribute) => `
            <tr>
              <th>${escapeHtml(attribute.label)}</th>
              <td>${escapeHtml(attribute.value)}</td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <th>Примітка</th>
        <td>Для цього товару характеристики не вказані.</td>
      </tr>
    `;

  return `
    <section class="product-page">
      <div class="product-topline">
        <span>Товар ${String(index + 1).padStart(2, "0")}</span>
        <span>${escapeHtml(product.category || "Каталог")}</span>
      </div>
      <div class="product-layout">
        <div class="product-gallery">
          ${gallery}
        </div>
        <div class="product-copy">
          <p class="product-brand">${escapeHtml(product.brand || "Product")}</p>
          <h2>${escapeHtml(product.productName)}</h2>
          <div class="meta-grid">
            <div>
              <span>SKU</span>
              <strong>${escapeHtml(product.sku || "Не вказано")}</strong>
            </div>
            <div>
              <span>Ціна</span>
              <strong>${formatPrice(product.price)}</strong>
            </div>
          </div>
          ${
            product.shortDescription
              ? `<p class="lead">${escapeHtml(product.shortDescription)}</p>`
              : ""
          }
          ${
            product.description
              ? `<p class="description">${escapeHtml(product.description)}</p>`
              : ""
          }
        </div>
      </div>
      <div class="specs-card">
        <h3>Характеристики</h3>
        <table>
          <tbody>${specs}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderCatalogHtml(products: CatalogProduct[]) {
  const today = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return `
    <!doctype html>
    <html lang="uk">
      <head>
        <meta charset="utf-8" />
        <title>Каталог товарів</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #231d19;
            font-family: "Segoe UI", Arial, sans-serif;
            background: #f7f1ea;
          }
          .page-break { page-break-after: always; }
          .cover,
          .summary-page,
          .product-page {
            min-height: 100vh;
            padding: 56px;
          }
          .cover {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background:
              radial-gradient(circle at top left, rgba(166, 90, 58, 0.22), transparent 30%),
              linear-gradient(180deg, #fdf7f1 0%, #f4ede4 100%);
          }
          .cover-kicker,
          .product-topline,
          .summary-topline {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: #826d5f;
          }
          .cover h1 {
            max-width: 10ch;
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 74px;
            line-height: 0.92;
            letter-spacing: -0.06em;
          }
          .cover p {
            max-width: 460px;
            color: #695d54;
            font-size: 18px;
            line-height: 1.8;
          }
          .cover-footer {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 20px;
          }
          .summary-page {
            background: #fffdf8;
          }
          .summary-page h2,
          .product-copy h2,
          .specs-card h3 {
            margin: 0;
          }
          .summary-page h2 {
            margin-top: 18px;
            font-size: 34px;
          }
          .summary-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin: 34px 0 0;
            padding: 0;
            list-style: none;
          }
          .summary-list li {
            padding: 18px 20px;
            border: 1px solid rgba(35, 29, 25, 0.1);
            border-radius: 18px;
            background: #fff;
          }
          .summary-list span,
          .summary-list small,
          .meta-grid span {
            display: block;
            color: #826d5f;
          }
          .summary-list strong {
            display: block;
            margin-top: 10px;
            font-size: 20px;
          }
          .summary-list small {
            margin-top: 8px;
            font-size: 13px;
          }
          .product-page {
            background: #fff;
          }
          .product-layout {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 32px;
            margin-top: 26px;
            align-items: start;
          }
          .product-gallery {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .hero-image {
            grid-column: 1 / -1;
            min-height: 420px;
          }
          .hero-image,
          .thumb-image {
            margin: 0;
            overflow: hidden;
            border-radius: 26px;
            background: #f5ede6;
          }
          .hero-image img,
          .thumb-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .thumb-image {
            min-height: 180px;
          }
          .product-brand {
            margin: 0 0 12px;
            color: #a65a3a;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-size: 12px;
            font-weight: 700;
          }
          .product-copy h2 {
            font-size: 38px;
            line-height: 1.05;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 24px;
          }
          .meta-grid div {
            padding: 16px;
            border-radius: 18px;
            background: #f7f1ea;
          }
          .meta-grid strong {
            display: block;
            margin-top: 8px;
            font-size: 18px;
          }
          .lead,
          .description {
            color: #5f554f;
            line-height: 1.8;
          }
          .lead {
            margin-top: 24px;
            font-size: 18px;
          }
          .description {
            margin-top: 18px;
            font-size: 15px;
          }
          .specs-card {
            margin-top: 28px;
            padding: 24px;
            border-radius: 26px;
            background: #f7f1ea;
          }
          .specs-card h3 {
            font-size: 22px;
          }
          table {
            width: 100%;
            margin-top: 18px;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 12px 0;
            text-align: left;
            border-bottom: 1px solid rgba(35, 29, 25, 0.1);
            vertical-align: top;
          }
          th {
            width: 32%;
            color: #826d5f;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <section class="cover page-break">
          <div class="cover-kicker">
            <span>Katalog</span>
            <span>${products.length} позицій</span>
          </div>
          <div>
            <h1>Каталог товарів</h1>
            <p>
              Оформлений PDF-каталог, автоматично згенерований з таблиці.
              Підійде для презентацій, продажів та швидкої підготовки комерційних матеріалів.
            </p>
          </div>
          <div class="cover-footer">
            <strong>Дата створення: ${today}</strong>
            <span>Generated with Katalog</span>
          </div>
        </section>

        <section class="summary-page page-break">
          <div class="summary-topline">
            <span>Зміст</span>
            <span>Products overview</span>
          </div>
          <h2>Список товарів</h2>
          <ol class="summary-list">
            ${renderSummary(products)}
          </ol>
        </section>

        ${products
          .map((product, index) => {
            const section = renderProduct(product, index);
            return index === products.length - 1 ? section : `${section}<div class="page-break"></div>`;
          })
          .join("")}
      </body>
    </html>
  `;
}
