import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import type { CatalogContact, CatalogProduct, CatalogTemplate } from "@/lib/types";

type PdfOptions = {
  products: CatalogProduct[];
  template: CatalogTemplate;
  contact: CatalogContact;
  outputPath: string;
};

type Theme = {
  name: string;
  bg: ReturnType<typeof rgb>;
  panel: ReturnType<typeof rgb>;
  panelSoft: ReturnType<typeof rgb>;
  text: ReturnType<typeof rgb>;
  muted: ReturnType<typeof rgb>;
  accent: ReturnType<typeof rgb>;
};

const PAGE = {
  width: 595,
  height: 842,
  margin: 42,
};

async function readFirstAvailableFont(paths: string[]) {
  for (const fontPath of paths) {
    try {
      await access(fontPath);
      return await readFile(fontPath);
    } catch {
      continue;
    }
  }

  throw new Error("Не вдалося знайти шрифт для генерації PDF.");
}

function getTheme(template: CatalogTemplate): Theme {
  if (template === "minimal-modern") {
    return {
      name: "Minimal Modern",
      bg: rgb(0.95, 0.96, 0.95),
      panel: rgb(1, 1, 1),
      panelSoft: rgb(0.93, 0.96, 0.95),
      text: rgb(0.13, 0.16, 0.15),
      muted: rgb(0.4, 0.44, 0.42),
      accent: rgb(0.23, 0.42, 0.38),
    };
  }

  return {
    name: "Classic B2B",
    bg: rgb(0.97, 0.95, 0.92),
    panel: rgb(1, 1, 1),
    panelSoft: rgb(0.96, 0.94, 0.91),
    text: rgb(0.14, 0.11, 0.1),
    muted: rgb(0.43, 0.38, 0.35),
    accent: rgb(0.6, 0.34, 0.21),
  };
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, size);

    if (width <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawTextBlock(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    font: PDFFont;
    size: number;
    color: ReturnType<typeof rgb>;
    lineHeight?: number;
    maxLines?: number;
  },
) {
  const lines = wrapText(text, options.font, options.size, options.maxWidth);
  const lineHeight = options.lineHeight ?? options.size * 1.35;
  const visibleLines = options.maxLines ? lines.slice(0, options.maxLines) : lines;

  visibleLines.forEach((line, index) => {
    page.drawText(line, {
      x: options.x,
      y: options.y - index * lineHeight,
      size: options.size,
      font: options.font,
      color: options.color,
    });
  });

  return options.y - visibleLines.length * lineHeight;
}

async function fetchEmbeddedImage(pdfDoc: PDFDocument, url: string): Promise<PDFImage | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const bytes = await response.arrayBuffer();
    const uint8 = new Uint8Array(bytes);

    if (contentType.includes("png")) {
      return await pdfDoc.embedPng(uint8);
    }

    return await pdfDoc.embedJpg(uint8);
  } catch {
    return null;
  }
}

function drawPlaceholder(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: Theme,
  label: string,
  font: PDFFont,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: theme.panelSoft,
    borderColor: theme.accent,
    borderWidth: 1,
    opacity: 0.9,
  });

  page.drawLine({
    start: { x: x + 20, y: y + 20 },
    end: { x: x + width - 20, y: y + height - 20 },
    thickness: 1,
    color: theme.accent,
    opacity: 0.35,
  });

  page.drawLine({
    start: { x: x + width - 20, y: y + 20 },
    end: { x: x + 20, y: y + height - 20 },
    thickness: 1,
    color: theme.accent,
    opacity: 0.35,
  });

  const textWidth = font.widthOfTextAtSize(label, 12);

  page.drawText(label, {
    x: x + (width - textWidth) / 2,
    y: y + height / 2 - 6,
    size: 12,
    font,
    color: theme.muted,
  });
}

async function drawImageCard(
  pdfDoc: PDFDocument,
  page: PDFPage,
  url: string | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: Theme,
  label: string,
  font: PDFFont,
) {
  const image = url ? await fetchEmbeddedImage(pdfDoc, url) : null;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: theme.panelSoft,
    borderColor: theme.panelSoft,
    borderWidth: 1,
  });

  if (!image) {
    drawPlaceholder(page, x, y, width, height, theme, label, font);
    return;
  }

  const scaled = image.scaleToFit(width, height);
  const drawX = x + (width - scaled.width) / 2;
  const drawY = y + (height - scaled.height) / 2;

  page.drawImage(image, {
    x: drawX,
    y: drawY,
    width: scaled.width,
    height: scaled.height,
  });
}

async function addCoverPage(
  pdfDoc: PDFDocument,
  theme: Theme,
  titleFont: PDFFont,
  bodyFont: PDFFont,
  products: CatalogProduct[],
) {
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: theme.bg,
  });

  page.drawText(theme.name, {
    x: PAGE.margin,
    y: PAGE.height - 54,
    size: 11,
    font: bodyFont,
    color: theme.accent,
  });

  drawTextBlock(page, "Каталог товарів", {
    x: PAGE.margin,
    y: PAGE.height - 120,
    maxWidth: 280,
    font: titleFont,
    size: 34,
    color: theme.text,
    lineHeight: 36,
  });

  drawTextBlock(
    page,
    "Охайний PDF-каталог, автоматично зібраний з вашої таблиці для презентацій, прайсів і комерційних матеріалів.",
    {
      x: PAGE.margin,
      y: PAGE.height - 220,
      maxWidth: 280,
      font: bodyFont,
      size: 12,
      color: theme.muted,
      lineHeight: 18,
    },
  );

  page.drawRectangle({
    x: 348,
    y: 112,
    width: 190,
    height: 600,
    color: theme.panel,
    borderColor: theme.panelSoft,
    borderWidth: 1,
  });

  page.drawText(`${products.length} позицій`, {
    x: 368,
    y: 662,
    size: 16,
    font: titleFont,
    color: theme.text,
  });

  products.slice(0, 8).forEach((product, index) => {
    page.drawText(`${String(index + 1).padStart(2, "0")}  ${product.productName}`, {
      x: 368,
      y: 626 - index * 42,
      size: 11,
      font: bodyFont,
      color: theme.text,
      maxWidth: 150,
    });
  });
}

function addSummaryPage(
  pdfDoc: PDFDocument,
  theme: Theme,
  titleFont: PDFFont,
  bodyFont: PDFFont,
  products: CatalogProduct[],
) {
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: theme.panel,
  });

  page.drawText("Список товарів", {
    x: PAGE.margin,
    y: PAGE.height - 68,
    size: 26,
    font: titleFont,
    color: theme.text,
  });

  page.drawText("Сортування: order, потім product_name", {
    x: PAGE.margin,
    y: PAGE.height - 96,
    size: 11,
    font: bodyFont,
    color: theme.muted,
  });

  let leftY = PAGE.height - 140;
  let rightY = PAGE.height - 140;

  products.forEach((product, index) => {
    const isLeft = index % 2 === 0;
    const x = isLeft ? PAGE.margin : 308;
    const y = isLeft ? leftY : rightY;

    page.drawRectangle({
      x,
      y: y - 44,
      width: 246,
      height: 34,
      color: theme.panelSoft,
      borderColor: theme.panelSoft,
      borderWidth: 1,
    });

    page.drawText(String(index + 1).padStart(2, "0"), {
      x: x + 12,
      y: y - 28,
      size: 10,
      font: bodyFont,
      color: theme.accent,
    });

    page.drawText(product.productName, {
      x: x + 42,
      y: y - 28,
      size: 11,
      font: bodyFont,
      color: theme.text,
      maxWidth: 190,
    });

    if (isLeft) {
      leftY -= 44;
    } else {
      rightY -= 44;
    }
  });
}

async function addProductPage(
  pdfDoc: PDFDocument,
  theme: Theme,
  titleFont: PDFFont,
  bodyFont: PDFFont,
  product: CatalogProduct,
  index: number,
) {
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  const imageX = PAGE.margin;
  const imageY = 366;
  const imageWidth = 286;
  const imageHeight = 386;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: theme.panel,
  });

  page.drawText(`Товар ${String(index + 1).padStart(2, "0")}`, {
    x: PAGE.margin,
    y: PAGE.height - 36,
    size: 10,
    font: bodyFont,
    color: theme.accent,
  });

  await drawImageCard(
    pdfDoc,
    page,
    product.images[0],
    imageX,
    imageY,
    imageWidth,
    imageHeight,
    theme,
    "Зображення",
    bodyFont,
  );

  const thumbWidth = 136;
  await drawImageCard(
    pdfDoc,
    page,
    product.images[1],
    PAGE.margin,
    214,
    thumbWidth,
    120,
    theme,
    "Фото",
    bodyFont,
  );
  await drawImageCard(
    pdfDoc,
    page,
    product.images[2],
    PAGE.margin + thumbWidth + 14,
    214,
    thumbWidth,
    120,
    theme,
    "Фото",
    bodyFont,
  );

  const textX = 352;
  let textY = PAGE.height - 70;

  page.drawText(product.brand || product.category || "Product", {
    x: textX,
    y: textY,
    size: 10,
    font: bodyFont,
    color: theme.accent,
  });

  textY -= 20;
  textY = drawTextBlock(page, product.productName, {
    x: textX,
    y: textY,
    maxWidth: 200,
    font: titleFont,
    size: 24,
    color: theme.text,
    lineHeight: 28,
    maxLines: 3,
  });

  textY -= 8;
  page.drawRectangle({
    x: textX,
    y: textY - 54,
    width: 200,
    height: 50,
    color: theme.panelSoft,
  });

  page.drawText(`SKU: ${product.sku || "Не вказано"}`, {
    x: textX + 12,
    y: textY - 22,
    size: 10,
    font: bodyFont,
    color: theme.text,
  });
  page.drawText(`Ціна: ${product.price || "За запитом"}`, {
    x: textX + 12,
    y: textY - 38,
    size: 10,
    font: bodyFont,
    color: theme.text,
  });

  textY -= 76;

  if (product.shortDescription) {
    textY = drawTextBlock(page, product.shortDescription, {
      x: textX,
      y: textY,
      maxWidth: 200,
      font: bodyFont,
      size: 11,
      color: theme.text,
      lineHeight: 16,
      maxLines: 5,
    });
    textY -= 10;
  }

  if (product.description) {
    textY = drawTextBlock(page, product.description, {
      x: textX,
      y: textY,
      maxWidth: 200,
      font: bodyFont,
      size: 9,
      color: theme.muted,
      lineHeight: 14,
      maxLines: 8,
    });
    textY -= 8;
  }

  page.drawRectangle({
    x: PAGE.margin,
    y: 48,
    width: PAGE.width - PAGE.margin * 2,
    height: 138,
    color: theme.panelSoft,
  });

  page.drawText("Характеристики", {
    x: PAGE.margin + 14,
    y: 162,
    size: 14,
    font: titleFont,
    color: theme.text,
  });

  const specs = product.attributes.length
    ? product.attributes.slice(0, 6)
    : [{ label: "Примітка", value: "Для цього товару характеристики не вказані." }];

  specs.forEach((attribute, specIndex) => {
    const rowY = 136 - specIndex * 20;
    page.drawText(attribute.label, {
      x: PAGE.margin + 14,
      y: rowY,
      size: 9,
      font: bodyFont,
      color: theme.muted,
    });
    page.drawText(attribute.value, {
      x: PAGE.margin + 168,
      y: rowY,
      size: 9,
      font: bodyFont,
      color: theme.text,
      maxWidth: 340,
    });
  });
}

function addContactPage(
  pdfDoc: PDFDocument,
  theme: Theme,
  titleFont: PDFFont,
  bodyFont: PDFFont,
  contact: CatalogContact,
) {
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: theme.bg,
  });

  page.drawRectangle({
    x: 56,
    y: 140,
    width: PAGE.width - 112,
    height: 520,
    color: theme.panel,
    borderColor: theme.panelSoft,
    borderWidth: 1,
  });

  page.drawText("Контакти", {
    x: 78,
    y: 620,
    size: 11,
    font: bodyFont,
    color: theme.accent,
  });

  drawTextBlock(page, "Готові обговорити каталог, прайс або індивідуальну підбірку товарів.", {
    x: 78,
    y: 582,
    maxWidth: 360,
    font: titleFont,
    size: 26,
    color: theme.text,
    lineHeight: 30,
  });

  const rows = [
    ["Компанія", contact.companyName],
    ["Контактна особа", contact.personName],
    ["Email", contact.email],
    ["Телефон", contact.phone],
    ["Вебсайт", contact.website],
  ];

  rows.forEach(([label, value], index) => {
    const y = 454 - index * 62;
    page.drawText(label, {
      x: 78,
      y,
      size: 10,
      font: bodyFont,
      color: theme.muted,
    });
    page.drawText(value, {
      x: 78,
      y: y - 22,
      size: 15,
      font: bodyFont,
      color: theme.text,
    });
  });
}

export async function generateCatalogPdf({
  products,
  template,
  contact,
  outputPath,
}: PdfOptions) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFontBytes = await readFirstAvailableFont([
    path.join(
      process.cwd(),
      "assets",
      "fonts",
      "noto-sans-cyrillic-400-normal.woff",
    ),
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\segoeui.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
  ]);
  const titleFontBytes = await readFirstAvailableFont([
    path.join(
      process.cwd(),
      "assets",
      "fonts",
      "noto-serif-cyrillic-700-normal.woff",
    ),
    "C:\\Windows\\Fonts\\georgiab.ttf",
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf",
  ]);

  const titleFont = await pdfDoc.embedFont(titleFontBytes);
  const bodyFont = await pdfDoc.embedFont(regularFontBytes);
  const theme = getTheme(template);

  await addCoverPage(pdfDoc, theme, titleFont, bodyFont, products);
  addSummaryPage(pdfDoc, theme, titleFont, bodyFont, products);

  for (const [index, product] of products.entries()) {
    await addProductPage(pdfDoc, theme, titleFont, bodyFont, product, index);
  }

  addContactPage(pdfDoc, theme, titleFont, bodyFont, contact);

  const bytes = await pdfDoc.save();
  await writeFile(outputPath, bytes);
}
