import type { CatalogContact, CatalogProduct, CatalogTemplate } from "@/lib/types";

type RenderOptions = {
  template: CatalogTemplate;
  contact: CatalogContact;
};

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

function imagePlaceholder(label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#efe6dc"/>
      <rect x="120" y="120" width="960" height="660" rx="40" fill="#f8f2eb" stroke="#d7c7b8" stroke-width="8"/>
      <circle cx="420" cy="370" r="72" fill="#d9c7b5"/>
      <path d="M300 650l170-180 110 110 130-160 190 230H300z" fill="#ceb9a6"/>
      <text x="600" y="760" text-anchor="middle" fill="#6f6054" font-family="Arial, sans-serif" font-size="40">
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

function renderGallery(product: CatalogProduct) {
  const fallback = imagePlaceholder("Image unavailable");

  return product.images
    .map(
      (image, imageIndex) => `
        <figure class="${imageIndex === 0 ? "hero-image" : "thumb-image"}">
          <img
            src="${escapeHtml(image)}"
            alt="${escapeHtml(product.productName)}"
            onerror="this.onerror=null;this.src='${fallback}'"
          />
        </figure>
      `,
    )
    .join("");
}

function renderProduct(product: CatalogProduct, index: number) {
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
          ${renderGallery(product)}
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

function renderContactPage(contact: CatalogContact) {
  return `
    <section class="contact-page">
      <div class="contact-card">
        <p class="contact-kicker">Контакти</p>
        <h2>Готові обговорити замовлення та адаптувати каталог під ваші задачі.</h2>
        <div class="contact-grid">
          <div>
            <span>Компанія</span>
            <strong>${escapeHtml(contact.companyName)}</strong>
          </div>
          <div>
            <span>Контактна особа</span>
            <strong>${escapeHtml(contact.personName)}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>${escapeHtml(contact.email)}</strong>
          </div>
          <div>
            <span>Телефон</span>
            <strong>${escapeHtml(contact.phone)}</strong>
          </div>
          <div class="contact-grid__full">
            <span>Вебсайт</span>
            <strong>${escapeHtml(contact.website)}</strong>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getTheme(template: CatalogTemplate) {
  if (template === "minimal-modern") {
    return {
      title: "Каталог товарів",
      coverLabel: "Minimal Modern",
      bg: "#f3f1ed",
      text: "#1f2321",
      muted: "#616866",
      accent: "#3b6a61",
      accentSoft: "#ddebe7",
      panel: "#ffffff",
      panelAlt: "#eef4f1",
      border: "rgba(31, 35, 33, 0.12)",
      gradient:
        "radial-gradient(circle at top right, rgba(59, 106, 97, 0.18), transparent 26%), linear-gradient(180deg, #fbfcfb 0%, #eef4f1 100%)",
    };
  }

  return {
    title: "Каталог товарів",
    coverLabel: "Classic B2B",
    bg: "#f7f1ea",
    text: "#231d19",
    muted: "#6e6157",
    accent: "#9a5636",
    accentSoft: "#f3e4d9",
    panel: "#ffffff",
    panelAlt: "#f6efe7",
    border: "rgba(35, 29, 25, 0.10)",
    gradient:
      "radial-gradient(circle at top left, rgba(154, 86, 54, 0.20), transparent 30%), linear-gradient(180deg, #fdf7f1 0%, #f4ede4 100%)",
  };
}

export function renderCatalogHtml(products: CatalogProduct[], options: RenderOptions) {
  const theme = getTheme(options.template);
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
        <title>${theme.title}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: ${theme.text};
            font-family: "Segoe UI", Arial, sans-serif;
            background: ${theme.bg};
          }
          .page-break { page-break-after: always; }
          .cover,
          .summary-page,
          .product-page,
          .contact-page {
            min-height: 100vh;
            padding: 52px;
          }
          .cover {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: ${theme.gradient};
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
            color: ${theme.muted};
          }
          .cover h1,
          .summary-page h2,
          .contact-card h2 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
          }
          .cover h1 {
            max-width: 10ch;
            font-size: 70px;
            line-height: 0.94;
            letter-spacing: -0.06em;
          }
          .cover p,
          .lead,
          .description,
          .summary-page p,
          .contact-card p {
            color: ${theme.muted};
            line-height: 1.8;
          }
          .cover p {
            max-width: 470px;
            font-size: 18px;
          }
          .cover-footer {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 20px;
          }
          .summary-page,
          .product-page {
            background: ${theme.panel};
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
          .summary-list li,
          .contact-card,
          .specs-card {
            border: 1px solid ${theme.border};
            background: ${theme.panel};
          }
          .summary-list li {
            padding: 18px 20px;
            border-radius: 18px;
          }
          .summary-list span,
          .summary-list small,
          .meta-grid span,
          .contact-grid span {
            display: block;
            color: ${theme.muted};
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
          .product-layout {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 30px;
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
            min-height: 410px;
          }
          .hero-image,
          .thumb-image {
            margin: 0;
            overflow: hidden;
            border-radius: 24px;
            background: ${theme.panelAlt};
          }
          .hero-image img,
          .thumb-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .thumb-image {
            min-height: 176px;
          }
          .product-brand,
          .contact-kicker {
            margin: 0 0 12px;
            color: ${theme.accent};
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-size: 12px;
            font-weight: 700;
          }
          .product-copy h2 {
            margin: 0;
            font-size: 38px;
            line-height: 1.05;
          }
          .meta-grid,
          .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 24px;
          }
          .meta-grid div,
          .contact-grid div {
            padding: 16px;
            border-radius: 18px;
            background: ${theme.panelAlt};
          }
          .meta-grid strong,
          .contact-grid strong {
            display: block;
            margin-top: 8px;
            font-size: 18px;
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
            background: ${theme.panelAlt};
          }
          .specs-card h3 {
            margin: 0;
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
            border-bottom: 1px solid ${theme.border};
            vertical-align: top;
          }
          th {
            width: 32%;
            color: ${theme.muted};
            font-weight: 600;
          }
          .contact-page {
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${theme.gradient};
          }
          .contact-card {
            width: 100%;
            border-radius: 30px;
            padding: 34px;
          }
          .contact-card h2 {
            max-width: 16ch;
            font-size: 40px;
            line-height: 1.04;
          }
          .contact-grid__full {
            grid-column: 1 / -1;
          }
        </style>
      </head>
      <body>
        <section class="cover page-break">
          <div class="cover-kicker">
            <span>${theme.coverLabel}</span>
            <span>${products.length} позицій</span>
          </div>
          <div>
            <h1>${theme.title}</h1>
            <p>
              Акуратний PDF-каталог, автоматично згенерований з Excel, CSV або
              Google Sheets. Підійде для продажів, шоурумів, прайсів і швидких презентацій.
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
            <span>${theme.coverLabel}</span>
          </div>
          <h2>Список товарів</h2>
          <p>Сортування виконується спочатку за order, а потім за назвою товару.</p>
          <ol class="summary-list">
            ${renderSummary(products)}
          </ol>
        </section>

        ${products
          .map((product, index) => {
            const section = renderProduct(product, index);
            return `${section}<div class="page-break"></div>`;
          })
          .join("")}

        ${renderContactPage(options.contact)}
      </body>
    </html>
  `;
}
