// Receives the documents uploaded from /upload-documents and saves them to
// <project>/uploads/<email>/<timestamp>/ on the server.
// NOTE: local disk only works on a normal Node server. For serverless hosting
// (e.g. Vercel) swap the writeFile call for S3 / Vercel Blob / etc.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { REGULATORY_DOCS } from "../../data/regulatoryDocs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_EXT = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const safeName = (s: string) => s.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const email = String(form.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid or missing email." }, { status: 400 });
  }

  // Files are sent as doc-1, doc-2, ... matching REGULATORY_DOCS order
  const files: { index: number; file: File }[] = [];
  for (const [key, value] of form.entries()) {
    const m = /^doc-(\d+)$/.exec(key);
    if (!m || !(value instanceof File) || value.size === 0) continue;
    const index = Number(m[1]);
    if (index < 1 || index > REGULATORY_DOCS.length) continue;

    const ext = path.extname(value.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: `"${value.name}": only PDF, JPG, PNG, DOC or DOCX files are allowed.` },
        { status: 400 },
      );
    }
    if (value.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${value.name}" is larger than 10 MB.` },
        { status: 400 },
      );
    }
    files.push({ index, file: value });
  }

  if (!files.length) {
    return NextResponse.json({ error: "Please attach at least one document." }, { status: 400 });
  }

  const dir = path.join(
    process.cwd(),
    "uploads",
    safeName(email),
    new Date().toISOString().replace(/[:.]/g, "-"),
  );
  await mkdir(dir, { recursive: true });

  const saved = [];
  for (const { index, file } of files) {
    const name = `${String(index).padStart(2, "0")}-${safeName(file.name)}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    saved.push({ document: REGULATORY_DOCS[index - 1].title, file: name });
  }

  console.log(`[upload-documents] ${email}: saved ${saved.length} file(s) to ${dir}`);
  return NextResponse.json({ ok: true, saved });
}
