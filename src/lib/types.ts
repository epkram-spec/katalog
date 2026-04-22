export type CatalogAttribute = {
  key: string;
  label: string;
  value: string;
};

export type CatalogIssue = {
  row: number;
  field: string;
  message: string;
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

export type CatalogTemplate = "classic-b2b" | "minimal-modern";

export type CatalogContact = {
  companyName: string;
  personName: string;
  email: string;
  phone: string;
  website: string;
};
