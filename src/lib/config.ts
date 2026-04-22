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
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  contact: {
    companyName: process.env.CATALOG_CONTACT_COMPANY ?? "Your Company",
    personName: process.env.CATALOG_CONTACT_PERSON ?? "Sales Team",
    email: process.env.CATALOG_CONTACT_EMAIL ?? "sales@example.com",
    phone: process.env.CATALOG_CONTACT_PHONE ?? "+380 00 000 00 00",
    website: process.env.CATALOG_CONTACT_WEBSITE ?? "https://example.com",
  },
};

export function isSmtpConfigured() {
  const { host, user, pass, from } = appConfig.smtp;

  return Boolean(host && user && pass && from);
}
