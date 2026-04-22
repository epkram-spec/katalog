import * as XLSX from "xlsx";

import type { CatalogAttribute, CatalogIssue, CatalogProduct } from "@/lib/types";

type RawRecord = Record<string, string | number | boolean | null | undefined>;

const IMAGE_COLUMNS = ["image_1", "image_2", "image_3"] as const;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function toStringValue(value: RawRecord[string]) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toAttributeLabel(key: string) {
  return key
    .replace(/^attr_/, "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toOrder(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export function parseWorkbook(buffer: Buffer, fileName: string) {
  const extension = fileName.toLowerCase().endsWith(".csv") ? "csv" : "xlsx";
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    raw: false,
    codepage: 65001,
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(
      extension === "csv"
        ? "Не вдалося прочитати CSV-файл."
        : "Не вдалося знайти аркуш у файлі Excel.",
    );
  }

  return XLSX.utils.sheet_to_json<RawRecord>(sheet, {
    defval: "",
  });
}

export function validateAndTransformProducts(records: RawRecord[]) {
  const validationErrors: CatalogIssue[] = [];
  const warnings: CatalogIssue[] = [];
  const rows = records
    .map((record, index) => ({
      rowNumber: index + 2,
      record,
    }))
    .filter(({ record }) => Object.values(record).some((value) => toStringValue(value)));

  const products = rows.map(({ record, rowNumber }) => {
    const normalized = Object.fromEntries(
      Object.entries(record).map(([key, value]) => [normalizeHeader(key), toStringValue(value)]),
    );

    const productName = normalized.product_name ?? "";
    const imageCandidates = IMAGE_COLUMNS.map((column) => normalized[column] ?? "").filter(Boolean);

    if (!productName) {
      validationErrors.push({
        row: rowNumber,
        field: "product_name",
        message: "Колонка product_name є обов'язковою.",
      });
    }

    if (!normalized.image_1) {
      validationErrors.push({
        row: rowNumber,
        field: "image_1",
        message: "Колонка image_1 є обов'язковою.",
      });
    }

    IMAGE_COLUMNS.forEach((column) => {
      const value = normalized[column];

      if (value && !isValidUrl(value)) {
        validationErrors.push({
          row: rowNumber,
          field: column,
          message: `Поле ${column} має містити коректний URL.`,
        });
      }
    });

    const attributes: CatalogAttribute[] = Object.entries(normalized)
      .filter(([key, value]) => key.startsWith("attr_") && value)
      .map(([key, value]) => ({
        key,
        label: toAttributeLabel(key),
        value,
      }));

    if (!normalized.brand && !normalized.category) {
      warnings.push({
        row: rowNumber,
        field: "brand/category",
        message: "Бажано вказати brand або category для кращого вигляду каталогу.",
      });
    }

    if (!normalized.price) {
      warnings.push({
        row: rowNumber,
        field: "price",
        message: "Ціна не вказана. У PDF буде показано “За запитом”.",
      });
    }

    if (!normalized.short_description && !normalized.description) {
      warnings.push({
        row: rowNumber,
        field: "description",
        message: "Немає short_description або description. Сторінка товару буде дуже лаконічною.",
      });
    }

    if (!attributes.length) {
      warnings.push({
        row: rowNumber,
        field: "attr_*",
        message: "Немає характеристик attr_*. Таблиця характеристик покаже примітку-заглушку.",
      });
    }

    return {
      productName,
      sku: normalized.sku ?? "",
      brand: normalized.brand ?? "",
      category: normalized.category ?? "",
      shortDescription: normalized.short_description ?? "",
      description: normalized.description ?? "",
      price: normalized.price ?? "",
      images: imageCandidates,
      order: toOrder(normalized.order ?? ""),
      attributes,
    } satisfies CatalogProduct;
  });

  const filteredProducts = products
    .filter((product) => product.productName && product.images[0])
    .sort((left, right) => left.order - right.order || left.productName.localeCompare(right.productName));

  return {
    products: filteredProducts,
    validationErrors,
    warnings,
  };
}
