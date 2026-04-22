import * as XLSX from "xlsx";

import type { CatalogAttribute, CatalogProduct, ValidationIssue } from "@/lib/types";

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
  const validationErrors: ValidationIssue[] = [];
  const nonEmptyRecords = records.filter((record) =>
    Object.values(record).some((value) => toStringValue(value)),
  );

  const products = nonEmptyRecords.map((record, index) => {
    const normalized = Object.fromEntries(
      Object.entries(record).map(([key, value]) => [normalizeHeader(key), toStringValue(value)]),
    );

    const productName = normalized.product_name ?? "";
    const imageCandidates = IMAGE_COLUMNS.map((column) => normalized[column] ?? "").filter(Boolean);

    if (!productName) {
      validationErrors.push({
        row: index + 2,
        field: "product_name",
        message: "Колонка product_name є обов'язковою.",
      });
    }

    if (!normalized.image_1) {
      validationErrors.push({
        row: index + 2,
        field: "image_1",
        message: "Колонка image_1 є обов'язковою.",
      });
    }

    IMAGE_COLUMNS.forEach((column) => {
      const value = normalized[column];

      if (value && !isValidUrl(value)) {
        validationErrors.push({
          row: index + 2,
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
  };
}
