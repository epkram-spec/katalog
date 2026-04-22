"use client";

import { FormEvent, useEffect, useState } from "react";

import type { CatalogIssue, CatalogTemplate } from "@/lib/types";

type ApiError = {
  error: string;
  validationErrors?: CatalogIssue[];
  warnings?: CatalogIssue[];
};

type ApiSuccess = {
  downloadUrl: string;
  emailedTo: string | null;
  productCount: number;
  fileName: string;
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

function parseHeaderJson<T>(value: string | null, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return fallback;
  }
}

export function CatalogGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [email, setEmail] = useState("");
  const [template, setTemplate] = useState<CatalogTemplate>("classic-b2b");
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<ApiSuccess | null>(null);

  useEffect(() => {
    return () => {
      if (result?.downloadUrl) {
        URL.revokeObjectURL(result.downloadUrl);
      }
    };
  }, [result]);

  useEffect(() => {
    if (!result?.downloadUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = result.downloadUrl;
    link.download = result.fileName;
    document.body.append(link);
    link.click();
    link.remove();
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (result?.downloadUrl) {
      URL.revokeObjectURL(result.downloadUrl);
    }

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

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok || contentType.includes("application/json")) {
        const payload = (await response.json()) as ApiError;
        setError(payload);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = decodeURIComponent(
        response.headers.get("X-Catalog-File-Name") ?? "catalog.pdf",
      );
      const emailedTo = decodeURIComponent(response.headers.get("X-Catalog-Emailed-To") ?? "") || null;
      const productCount = Number(response.headers.get("X-Catalog-Product-Count") ?? "0");
      const warnings = parseHeaderJson<CatalogIssue[]>(
        response.headers.get("X-Catalog-Warnings"),
        [],
      );

      setResult({
        downloadUrl,
        emailedTo,
        productCount,
        fileName,
        warnings,
      });
    } catch {
      setError({
        error: "Не вдалося згенерувати каталог. Спробуйте ще раз.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    if (result?.downloadUrl) {
      URL.revokeObjectURL(result.downloadUrl);
    }

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
            <small>Необов&apos;язково.</small>
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
            <p style={{ marginTop: 8 }}>
              <a href={result.downloadUrl} download={result.fileName}>
                Завантажити PDF ще раз
              </a>
            </p>
            {result.emailedTo ? (
              <p style={{ marginTop: 8 }}>
                PDF надіслано на <strong>{result.emailedTo}</strong>.
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
