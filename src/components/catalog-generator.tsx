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
    description: "Спокійний, діловий стиль для комерційних каталогів.",
  },
  {
    value: "minimal-modern",
    label: "Minimal Modern",
    description: "Легший сучасний стиль для брендів, шоурумів і презентацій.",
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
        error: "Не вдалося згенерувати каталог. Спробуйте ще раз.",
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
      <div className="panel panel--form">
        <div className="section-head">
          <div>
            <h2>Створити каталог</h2>
            <p className="section-copy">
              Оберіть файл або вставте публічне посилання на Google Sheets.
            </p>
          </div>
          <span className="tag">PDF для друку</span>
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
          </div>

          <div className="field">
            <label htmlFor="sheetUrl">Або посилання на Google Sheets</label>
            <input
              id="sheetUrl"
              className="input"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="template">Стиль каталогу</label>
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
            <small>Необов’язково.</small>
          </div>

          <div className="actions">
            <button className="button button--primary" type="submit" disabled={isLoading}>
              {isLoading ? "Генеруємо..." : "Створити PDF"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={handleReset}
              disabled={isLoading}
            >
              Очистити
            </button>
          </div>
        </form>

        {error ? (
          <div className="alert" style={{ marginTop: 18 }}>
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
                <p>Попередження:</p>
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
          <div className="result-card" style={{ marginTop: 18 }}>
            <p>Готово. У каталозі {result.productCount} товарів.</p>
            {result.downloadUrl ? (
              <p style={{ marginTop: 8 }}>
                <a href={result.downloadUrl} target="_blank" rel="noreferrer">
                  Завантажити PDF
                </a>
              </p>
            ) : null}
            {result.emailedTo ? (
              <p style={{ marginTop: 8 }}>
                PDF надіслано на <strong>{result.emailedTo}</strong>.
              </p>
            ) : null}
            {result.expiresAt ? (
              <p style={{ marginTop: 8 }}>
                Посилання активне до {new Date(result.expiresAt).toLocaleString("uk-UA")}.
              </p>
            ) : null}
            {result.warnings.length ? (
              <div className="warning-card" style={{ marginTop: 12 }}>
                <p>Попередження:</p>
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
          <h3>Що буде в PDF</h3>
          <ul className="feature-list">
            <li>Обкладинка</li>
            <li>Список товарів</li>
            <li>Сторінки з фото, описом і характеристиками</li>
            <li>Фінальна контактна сторінка</li>
          </ul>
        </div>

        <div className="divider" />

        <div>
          <h3>Demo-файли</h3>
          <p className="section-copy">
            Можна одразу перевірити роботу на готовому наборі з 5 товарами.
          </p>
          <div className="demo-links">
            <a href="/demo/catalog-demo.csv" download>
              CSV demo
            </a>
            <a href="/demo/catalog-demo.xlsx" download>
              XLSX demo
            </a>
          </div>
        </div>
      </aside>
    </section>
  );
}
