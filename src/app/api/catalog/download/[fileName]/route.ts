import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import { GENERATED_DIR } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    fileName: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { fileName } = await params;

  if (!/^[a-z0-9-]+\.pdf$/i.test(fileName)) {
    return NextResponse.json(
      {
        error: "Некоректне ім'я файлу.",
      },
      { status: 400 },
    );
  }

  const filePath = path.join(GENERATED_DIR, fileName);

  try {
    await access(filePath);

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Файл не знайдено або його вже видалено.",
      },
      { status: 404 },
    );
  }
}
