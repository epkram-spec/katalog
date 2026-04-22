import nodemailer from "nodemailer";

import { appConfig, isSmtpConfigured } from "@/lib/config";

type SendCatalogEmailInput = {
  to: string;
  fileName: string;
  pdfBytes: Uint8Array;
  productCount: number;
};

export async function sendCatalogEmail({
  to,
  fileName,
  pdfBytes,
  productCount,
}: SendCatalogEmailInput) {
  if (!isSmtpConfigured()) {
    throw new Error(
      "Email-відправка недоступна. Додайте SMTP_HOST, SMTP_USER, SMTP_PASS і SMTP_FROM у .env.local.",
    );
  }

  const transport = nodemailer.createTransport({
    host: appConfig.smtp.host,
    port: appConfig.smtp.port,
    secure: appConfig.smtp.secure,
    auth: {
      user: appConfig.smtp.user,
      pass: appConfig.smtp.pass,
    },
  });

  await transport.sendMail({
    from: appConfig.smtp.from,
    to,
    subject: "Ваш PDF-каталог готовий",
    text: `Каталог з ${productCount} товарами вже готовий. PDF додано як вкладення.`,
    html: `
      <p>Каталог з <strong>${productCount}</strong> товарами вже готовий.</p>
      <p>PDF додано до листа як вкладення.</p>
    `,
    attachments: [
      {
        filename: fileName,
        content: Buffer.from(pdfBytes),
      },
    ],
  });
}
