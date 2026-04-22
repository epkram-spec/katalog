"use client";

import { FormEvent, useState } from "react";

type ValidationIssue = {
  row: number;
  field: string;
  message: string;
};

type ApiError = {
  error: string;
  validationErrors?: ValidationIssue[];
};

type ApiSuccess = {
  downloadUrl: string | null;
  emailedTo: string | null;
  expiresAt: string | null;
  fileDeletedAfterEmail: boolean;
  productCount: number;
  fileName: string | null;
};

export function CatalogGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [email, setEmail] = useState("");
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
        error:
          "Не вдалося згенерувати каталог. Перевірте дані та спробуйте ще раз.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setSourceFile(null);
    setSheetUrl("");
    setEmail("");
    setError(null);
    setResult(null);
  }

  return (
    <section className="grid">
      <div className="panel">
        <h2>Створити каталог</h2>
        <p className="section-copy">
          Оберіть один із варіантів: завантажте файл <code>.xlsx</code> або{" "}
          <code>.csv</code>, або вставте публічне посилання на Google Sheets.
          Email необов&apos;язковий, але якщо його вказати, PDF можна одразу
          надіслати як вкладення.
        </p>

        <div className="mode-grid">
          <div className="mode-card">
            <strong>Файл</strong>
            <p className="muted">Підтримуються таблиці Excel та CSV.</p>
          </div>
          <div className="mode-card">
            <strong>Google Sheets</strong>
            <p className="muted">
              Працює з публічними таблицями без авторизації.
            </p>
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
              onChange={(event) =>
                setSourceFile(event.target.files?.[0] ?? null)
              }
            />
            <small>
              Якщо обрано файл, посилання на Google Sheets можна залишити порожнім.
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
              Таблиця має бути відкритою для перегляду за посиланням.
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
              Якщо SMTP не налаштований, генерація PDF все одно працюватиме, але
              без email-відправки.
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
                Файл видалено після email-відправки згідно з налаштуваннями.
              </p>
            ) : null}
            {result.expiresAt ? (
              <p style={{ marginTop: 8 }}>
                Посилання доступне тимчасово, до{" "}
                {new Date(result.expiresAt).toLocaleString("uk-UA")}.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="panel panel--stack">
        <div>
          <h3>Що є в MVP</h3>
          <ul className="feature-list">
            <li>Валідація обов&apos;язкових полів і URL картинок.</li>
            <li>Генерація HTML-каталогу з обкладинкою та товарами.</li>
            <li>PDF через Playwright.</li>
            <li>Тимчасове зберігання файлів і автоочистка.</li>
            <li>Опційна відправка готового PDF на email.</li>
          </ul>
        </div>

        <div className="divider" />

        <div>
          <h3>Demo-файли</h3>
          <p className="section-copy">
            Можна одразу протестувати генерацію на готових прикладах з 5 товарами.
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
          <h3>Порада по Google Sheets</h3>
          <p className="section-copy">
            Найкраще працює стандартне посилання виду{" "}
            <code>docs.google.com/spreadsheets/d/ID</code>. Якщо в таблиці кілька
            листів, сервіс спробує використати <code>gid</code> з URL.
          </p>
        </div>
      </aside>
    </section>
  );
}
