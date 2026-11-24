import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { to, country, honeypot } = body;

  // Bot trap
  if (honeypot) return NextResponse.json({ ok: true });

  // `to` = Trade Owner Email ID entered on the Product Summary page
  if (!to) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  // Link to the document upload page. Set APP_URL in production
  // (e.g. https://pharma.example.com); falls back to the current host.
  const baseUrl = (process.env.APP_URL || req.nextUrl.origin).replace(
    /\/$/,
    "",
  );
  const params = new URLSearchParams({ email: to });
  if (typeof country === "string" && country) params.set("country", country);
  const uploadUrl = `${baseUrl}/upload-documents?${params}`;
  const market =
    typeof country === "string" && country ? country : "the target market";

  const { error } = await resend.emails.send({
    from: "CuraLex <hello@krylox.ai>",
    to,
    subject:
      "Action required: Upload your NAFDAC product registration documents | CuraLex",
    text: [
      "Dear Trade Owner,",
      "",
      `A product registration for ${market} has been started on CuraLex. Before the registration dossier can be compiled, we need your supporting documents.`,
      "",
      "As the Trade Owner, please upload the documents required by NAFDAC using the secure link below:",
      uploadUrl,
      "",
      "Before you start:",
      "- The upload page lists each required document, with details of what it must contain.",
      "- Accepted formats: PDF, JPG, PNG, DOC or DOCX, up to 10 MB per file.",
      "- You can upload the documents you have now and add the rest later.",
      "",
      "If you were not expecting this request, you can ignore this email.",
      "",
      "Regards,",
      "CuraLex Regulatory Team",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1c2638;max-width:560px;margin:0 auto;border:1px solid #e1e7ef;border-radius:12px;overflow:hidden">
        <div style="background:#1d4fb8;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:bold">
          CuraLex
        </div>
        <div style="padding:24px;font-size:14px;line-height:1.6">
          <p style="margin:0 0 12px">Dear Trade Owner,</p>
          <p style="margin:0 0 12px">
            A product registration for <strong>${escapeHtml(market)}</strong>
            has been started on CuraLex. Before the registration dossier can be
            compiled, we need your supporting documents.
          </p>
          <p style="margin:0 0 12px">
            As the Trade Owner, please upload the documents required by
            <strong>NAFDAC</strong> using the secure link below.
          </p>
          <p style="margin:24px 0">
            <a href="${escapeHtml(uploadUrl)}"
               style="background:#1d4fb8;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
              Upload registration documents
            </a>
          </p>
          <div style="background:#f6f8fb;border:1px solid #e1e7ef;border-radius:8px;padding:12px 16px;margin:0 0 16px">
            <p style="margin:0 0 6px;font-weight:bold;color:#0f1f3a">Before you start</p>
            <ul style="margin:0;padding-left:18px;color:#2f3b4f">
              <li>The upload page lists each required document, with details of what it must contain.</li>
              <li>Accepted formats: PDF, JPG, PNG, DOC or DOCX, up to 10&nbsp;MB per file.</li>
              <li>You can upload the documents you have now and add the rest later.</li>
            </ul>
          </div>
          <p style="margin:0 0 16px;color:#5c6a7e;font-size:12px">
            If the button doesn't work, copy this link into your browser:<br />
            <a href="${escapeHtml(uploadUrl)}" style="color:#1d4fb8;word-break:break-all">${escapeHtml(uploadUrl)}</a>
          </p>
          <p style="margin:0">Regards,<br />CuraLex Regulatory Team</p>
        </div>
        <div style="border-top:1px solid #e1e7ef;padding:12px 24px;font-size:12px;color:#8c99ab">
          If you were not expecting this request, you can ignore this email.
        </div>
      </div>`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
