const DEFAULT_TTL_MINUTES = 60;

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appConfig = {
  pdfTtlMinutes: parseNumber(process.env.PDF_TTL_MINUTES, DEFAULT_TTL_MINUTES),
  deletePdfAfterEmail: parseBoolean(
    process.env.DELETE_PDF_AFTER_EMAIL,
    false,
  ),
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
};

export function isSmtpConfigured() {
  const { host, user, pass, from } = appConfig.smtp;

  return Boolean(host && user && pass && from);
}
