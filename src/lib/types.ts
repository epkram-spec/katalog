export type CatalogAttribute = {
  key: string;
  label: string;
  value: string;
};

export type CatalogProduct = {
  productName: string;
  sku: string;
  brand: string;
  category: string;
  shortDescription: string;
  description: string;
  price: string;
  images: string[];
  order: number;
  attributes: CatalogAttribute[];
};

export type ValidationIssue = {
  row: number;
  field: string;
  message: string;
};
