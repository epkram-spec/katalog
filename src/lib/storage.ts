import { randomUUID } from "node:crypto";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

import { appConfig } from "@/lib/config";

export const GENERATED_DIR = path.join(process.cwd(), "tmp", "generated");

export async function ensureGeneratedDir() {
  await mkdir(GENERATED_DIR, {
    recursive: true,
  });
}

export function createGeneratedPdfDescriptor(baseName: string) {
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "catalog";
  const fileName = `${safeName}-${randomUUID()}.pdf`;
  const filePath = path.join(GENERATED_DIR, fileName);

  return {
    fileName,
    filePath,
    downloadUrl: `/api/catalog/download/${fileName}`,
  };
}

export function getExpiryDate() {
  return new Date(Date.now() + appConfig.pdfTtlMinutes * 60_000);
}

export async function cleanupExpiredGeneratedFiles() {
  await ensureGeneratedDir();

  const files = await readdir(GENERATED_DIR);
  const now = Date.now();
  const maxAge = appConfig.pdfTtlMinutes * 60_000;

  await Promise.all(
    files
      .filter((file) => file.endsWith(".pdf"))
      .map(async (file) => {
        const filePath = path.join(GENERATED_DIR, file);
        const metadata = await stat(filePath);

        if (now - metadata.mtimeMs > maxAge) {
          await rm(filePath, {
            force: true,
          });
        }
      }),
  );
}

export async function removeGeneratedFile(filePath: string) {
  await rm(filePath, {
    force: true,
  });
}
