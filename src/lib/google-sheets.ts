export function toGoogleSheetsCsvUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error("Некоректне посилання на Google Sheets.");
  }

  if (url.hostname !== "docs.google.com") {
    throw new Error("Підтримуються лише посилання на docs.google.com.");
  }

  const match = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  if (!match) {
    throw new Error("Не вдалося знайти spreadsheetId у посиланні Google Sheets.");
  }

  const spreadsheetId = match[1];
  const hashGid = url.hash.match(/gid=(\d+)/)?.[1];
  const gid = url.searchParams.get("gid") ?? hashGid;

  return gid
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`
    : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
}

export async function fetchGoogleSheetBuffer(input: string) {
  const csvUrl = toGoogleSheetsCsvUrl(input);
  const response = await fetch(csvUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Не вдалося завантажити Google Sheets. Переконайтеся, що таблиця є публічною та доступною за посиланням.",
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
