import { NextResponse } from "next/server";
import { z } from "zod";

import { validateAndTransformProducts, parseWorkbook } from "@/lib/catalog";
import { appConfig } from "@/lib/config";
import { sendCatalogEmail } from "@/lib/email";
import { fetchGoogleSheetBuffer } from "@/lib/google-sheets";
import { renderCatalogHtml } from "@/lib/html-template";
import { generatePdfFromHtml } from "@/lib/pdf";
import {
  cleanupExpiredGeneratedFiles,
  createGeneratedPdfDescriptor,
  ensureGeneratedDir,
  getExpiryDate,
  removeGeneratedFile,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailSchema = z.string().trim().email();

export async function POST(request: Request) {
  try {
    await ensureGeneratedDir();
    await cleanupExpiredGeneratedFiles();

    const formData = await request.formData();
    const file = formData.get("file");
    const sheetUrl = String(formData.get("sheetUrl") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!(file instanceof File) && !sheetUrl) {
      return NextResponse.json(
        {
          error:
            "Завантажте файл .xlsx або .csv, або вставте посилання на Google Sheets.",
        },
        { status: 400 },
      );
    }

    if (email) {
      const parsedEmail = emailSchema.safeParse(email);

      if (!parsedEmail.success) {
        return NextResponse.json(
          {
            error: "Email має бути у коректному форматі.",
          },
          { status: 400 },
        );
      }
    }

    const sourceBuffer =
      file instanceof File
        ? Buffer.from(await file.arrayBuffer())
        : await fetchGoogleSheetBuffer(sheetUrl);
    const sourceName = file instanceof File ? file.name : "google-sheets.csv";
    const records = parseWorkbook(sourceBuffer, sourceName);

    if (!records.length) {
      return NextResponse.json(
        {
          error: "Таблиця порожня. Додайте хоча б один товар.",
        },
        { status: 400 },
      );
    }

    const { products, validationErrors } = validateAndTransformProducts(records);

    if (validationErrors.length) {
      return NextResponse.json(
        {
          error: "У таблиці є помилки. Виправте їх і спробуйте ще раз.",
          validationErrors,
        },
        { status: 400 },
      );
    }

    if (!products.length) {
      return NextResponse.json(
        {
          error: "Не знайдено жодного валідного товару для каталогу.",
        },
        { status: 400 },
      );
    }

    const descriptor = createGeneratedPdfDescriptor("catalog");
    const html = renderCatalogHtml(products);

    await generatePdfFromHtml(html, descriptor.filePath);

    let emailedTo: string | null = null;
    let fileDeletedAfterEmail = false;

    if (email) {
      await sendCatalogEmail({
        to: email,
        fileName: descriptor.fileName,
        filePath: descriptor.filePath,
        productCount: products.length,
      });

      emailedTo = email;

      if (appConfig.deletePdfAfterEmail) {
        await removeGeneratedFile(descriptor.filePath);
        fileDeletedAfterEmail = true;
      }
    }

    return NextResponse.json({
      downloadUrl: fileDeletedAfterEmail ? null : descriptor.downloadUrl,
      emailedTo,
      expiresAt: fileDeletedAfterEmail ? null : getExpiryDate().toISOString(),
      fileDeletedAfterEmail,
      productCount: products.length,
      fileName: fileDeletedAfterEmail ? null : descriptor.fileName,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Сталася неочікувана помилка під час генерації каталогу.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
