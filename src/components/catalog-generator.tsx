"use client";

import { FormEvent, useState } from "react";

import type { CatalogIssue, CatalogTemplate } from "@/lib/types";

type ApiError = {
  error: string;
  validationErrors?: CatalogIssue[];
  warnings?: CatalogIssue[];
};

type ApiSuccess = {
  downloadUrl: string | null;
  emailedTo: string | null;
  expiresAt: string | null;
  fileDeletedAfterEmail: boolean;
  productCount: number;
  fileName: string | null;
  warnings: CatalogIssue[];
};

const templateOptions: Array<{ value: CatalogTemplate; label: string; description: string }> = [
  {
    value: "classic-b2b",
    label: "Classic B2B",
    description: "Більш діловий стиль для прайсів, дилерів і комерційних PDF.",
  },
  {
    value: "minimal-modern",
    label: "Minimal Modern",
    description: "Легший візуальний стиль для шоурумів, брендів і презентацій.",
  },
];

export function CatalogGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [email, setEmail] = useState("");
  const [template, setTemplate] = useState<CatalogTemplate>("classic-b2b");
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<ApiSuccess | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();

    if (sourceFile) {
      formData.append("file", sourceFile);
    }

    if (sheetUrl.trim()) {
      formData.append("sheetUrl", sheetUrl.trim());
    }

    if (email.trim()) {
      formData.append("email", email.trim());
    }

    formData.append("template", template);

    try {
      const response = await fetch("/api/catalog/generate", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ApiError | ApiSuccess;

      if (!response.ok) {
        setError(payload as ApiError);
        return;
      }

      setResult(payload as ApiSuccess);
    } catch {
      setError({
        error: "Не вдалося згенерувати каталог. Перевірте дані та спробуйте ще раз.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setSourceFile(null);
    setSheetUrl("");
    setEmail("");
    setTemplate("classic-b2b");
    setError(null);
    setResult(null);
  }

  return (
    <section className="grid">
      <div className="panel">
        <h2>Створити каталог</h2>
        <p className="section-copy">
          Оберіть джерело даних, стиль каталогу та, за бажанням, email для
          автоматичної відправки PDF. Якщо є критичні помилки, сервіс їх покаже.
          Якщо є лише warning-и, PDF все одно буде створено.
        </p>

        <div className="mode-grid">
          <div className="mode-card">
            <strong>Файл</strong>
            <p className="muted">Підтримуються таблиці Excel та CSV.</p>
          </div>
          <div className="mode-card">
            <strong>Google Sheets</strong>
            <p className="muted">Працює лише з публічними посиланнями.</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="file">Файл таблиці</label>
            <input
              id="file"
              className="file-input"
              type="file"
              accept=".xlsx,.csv"
              onChange={(event) => setSourceFile(event.target.files?.[0] ?? null)}
            />
            <small>
              Якщо ви обрали файл, поле Google Sheets можна залишити порожнім.
            </small>
          </div>

          <div className="field">
            <label htmlFor="sheetUrl">Посилання на Google Sheets</label>
            <input
              id="sheetUrl"
              className="input"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
            />
            <small>
              Підтримуються публічні посилання виду <code>/spreadsheets/d/ID</code>.{" "}
              Якщо в URL є <code>gid</code>, буде використано саме цей лист.
            </small>
          </div>

          <div className="field">
            <label htmlFor="template">Шаблон каталогу</label>
            <select
              id="template"
              className="input"
              value={template}
              onChange={(event) => setTemplate(event.target.value as CatalogTemplate)}
            >
              {templateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small>
              <strong>{templateOptions.find((option) => option.value === template)?.label}</strong>
              :{" "}
              {templateOptions.find((option) => option.value === template)?.description}
            </small>
          </div>

          <div className="field">
            <label htmlFor="email">Email для відправки PDF</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <small>
              Необов’язково. Якщо SMTP не налаштований, генерація PDF все одно
              працюватиме, але без email-відправки.
            </small>
          </div>

          <div className="actions">
            <button className="button button--primary" type="submit" disabled={isLoading}>
              {isLoading ? "Генеруємо PDF..." : "Згенерувати каталог"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={handleReset}
              disabled={isLoading}
            >
              Очистити форму
            </button>
          </div>
        </form>

        {error ? (
          <div className="alert" style={{ marginTop: 20 }}>
            <p>{error.error}</p>
            {error.validationErrors?.length ? (
              <ul className="status-list">
                {error.validationErrors.map((issue, index) => (
                  <li key={`${issue.row}-${issue.field}-${index}`}>
                    Рядок {issue.row}: {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {error.warnings?.length ? (
              <div className="warning-card">
                <p>Warning-и, які не блокують генерацію:</p>
                <ul className="status-list">
                  {error.warnings.map((issue, index) => (
                    <li key={`${issue.row}-${issue.field}-warning-${index}`}>
                      Рядок {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {result ? (
          <div className="result-card" style={{ marginTop: 20 }}>
            <p>Каталог згенеровано. Товарів у PDF: {result.productCount}.</p>
            {result.downloadUrl ? (
              <p style={{ marginTop: 8 }}>
                Завантажити PDF:{" "}
                <a href={result.downloadUrl} target="_blank" rel="noreferrer">
                  {result.fileName ?? "catalog.pdf"}
                </a>
              </p>
            ) : null}
            {result.emailedTo ? (
              <p style={{ marginTop: 8 }}>
                PDF надіслано на <strong>{result.emailedTo}</strong>.
              </p>
            ) : null}
            {result.fileDeletedAfterEmail ? (
              <p style={{ marginTop: 8 }}>
                Після успішної email-відправки файл було видалено.
              </p>
            ) : null}
            {result.expiresAt ? (
              <p style={{ marginTop: 8 }}>
                Посилання доступне тимчасово, до{" "}
                {new Date(result.expiresAt).toLocaleString("uk-UA")}.
              </p>
            ) : null}
            {result.warnings.length ? (
              <div className="warning-card" style={{ marginTop: 14 }}>
                <p>Warning-и по таблиці:</p>
                <ul className="status-list">
                  {result.warnings.map((issue, index) => (
                    <li key={`${issue.row}-${issue.field}-result-${index}`}>
                      Рядок {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="panel panel--stack">
        <div>
          <h3>Що вже є</h3>
          <ul className="feature-list">
            <li>Валідація обов’язкових полів і URL картинок.</li>
            <li>Ігнорування повністю порожніх рядків.</li>
            <li>2 шаблони: Classic B2B і Minimal Modern.</li>
            <li>Плейсхолдер, якщо зображення не завантажилось.</li>
            <li>Фінальна контактна сторінка в PDF.</li>
          </ul>
        </div>

        <div className="divider" />

        <div>
          <h3>Demo-файли</h3>
          <p className="section-copy">
            У репозиторії є готові приклади з 5 товарами для швидкої перевірки.
          </p>
          <div className="demo-links">
            <a href="/demo/catalog-demo.csv" download>
              Завантажити CSV demo
            </a>
            <a href="/demo/catalog-demo.xlsx" download>
              Завантажити XLSX demo
            </a>
          </div>
        </div>

        <div className="divider" />

        <div>
          <h3>Важливо про хостинг</h3>
          <p className="section-copy">
            Цей застосунок не підходить для GitHub Pages, бо він має серверні API
            routes і PDF-генерацію через Node.js. Для продакшн або демо краще
            використовувати Vercel.
          </p>
        </div>
      </aside>
    </section>
  );
}
