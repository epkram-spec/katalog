import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export async function generatePdfFromHtml(html: string, outputPath: string) {
  const isVercel = Boolean(process.env.VERCEL);
  const browser = isVercel
    ? await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    : await puppeteer.launch({
        headless: true,
      });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForNetworkIdle({
      idleTime: 700,
      timeout: 10_000,
    }).catch(() => undefined);

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
