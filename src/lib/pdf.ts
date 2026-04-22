import { chromium } from "playwright";

export async function generatePdfFromHtml(html: string, outputPath: string) {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "18px",
        right: "18px",
        bottom: "18px",
        left: "18px",
      },
    });
  } finally {
    await browser.close();
  }
}
