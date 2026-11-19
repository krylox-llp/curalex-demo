"use client";

import { useRef, useState } from "react";
import formStyles from "./ProductForm.module.scss";
import summaryStyles from "./ProductSummary.module.scss";
import styles from "./DocumentUpload.module.scss";
import { Icon } from "./Icon";
import { REGULATORY_DOCS, type Point } from "../data/regulatoryDocs";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // keep in sync with the API route

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type Status =
  | { type: "idle" | "sending" }
  | { type: "success"; count: number }
  | { type: "error"; message: string };

export default function DocumentUpload({
  email,
  country,
}: {
  email: string;
  country: string;
}) {
  // files[i] = file attached to REGULATORY_DOCS[i]
  const [files, setFiles] = useState<(File | null)[]>(() =>
    REGULATORY_DOCS.map(() => null),
  );
  const [errors, setErrors] = useState<string[]>(() =>
    REGULATORY_DOCS.map(() => ""),
  );
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const attached = files.filter(Boolean).length;
  const total = REGULATORY_DOCS.length;

  function setFile(i: number, file: File | null) {
    let error = "";
    if (file) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPT.split(",").includes(ext)) {
        error = "Only PDF, JPG, PNG, DOC or DOCX files are allowed";
      } else if (file.size > MAX_FILE_BYTES) {
        error = "File must be 10 MB or smaller";
      }
    }
    setErrors((e) => e.map((v, j) => (j === i ? error : v)));
    if (!error) setFiles((f) => f.map((v, j) => (j === i ? file : v)));
  }

  async function handleSubmit() {
    if (!attached || status.type === "sending") return;
    const body = new FormData();
    body.set("email", email);
    if (country) body.set("country", country);
    files.forEach((f, i) => f && body.set(`doc-${i + 1}`, f));

    setStatus({ type: "sending" });
    try {
      const res = await fetch("/api/upload-documents", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      setStatus({ type: "success", count: attached });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  if (!email) {
    return (
      <div className={formStyles.page}>
        <div className={summaryStyles.card}>
          <p className={summaryStyles.empty}>
            This upload link is invalid. Please open the link from your email
            again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={formStyles.page}>
      <header className={formStyles.header}>
        <div>
          <h1 className={formStyles.title}>Upload Documents</h1>
          <p className={formStyles.subtitle}>
            Upload the documents required for product registration with NAFDAC.
          </p>
        </div>
      </header>

      <div className={summaryStyles.card}>
        <div className={styles.meta}>
          <span className={styles.progressText}>
            {attached} of {total} documents attached
          </span>
          <div
            className={styles.progress}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={attached}
            aria-label="Documents attached"
          >
            <span style={{ width: `${(attached / total) * 100}%` }} />
          </div>
        </div>

        <ol className={summaryStyles.docList}>
          {REGULATORY_DOCS.map((doc, i) => (
            <UploadItem
              key={doc.title}
              index={i + 1}
              title={doc.title}
              points={doc.points}
              file={files[i]}
              error={errors[i]}
              disabled={status.type === "sending"}
              onChange={(f) => setFile(i, f)}
            />
          ))}
        </ol>
      </div>

      <div className={summaryStyles.actions}>
        <span className={summaryStyles.hint}>
          PDF, JPG, PNG, DOC or DOCX · max 10 MB per file
        </span>
        <button
          type="button"
          className={`${summaryStyles.btn} ${summaryStyles.btnPrimary}`}
          disabled={!attached || status.type === "sending"}
          onClick={handleSubmit}
        >
          <Icon name="upload" />
          {status.type === "sending" ? "Uploading…" : "Submit Documents"}
        </button>
      </div>

      {(status.type === "success" || status.type === "error") && (
        <div
          className={formStyles.overlay}
          onClick={() => setStatus({ type: "idle" })}
        >
          <div
            role={status.type === "error" ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby="upload-popup-title"
            className={`${formStyles.popup} ${
              status.type === "success"
                ? formStyles.popupSuccess
                : formStyles.popupWarning
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={formStyles.popupIcon} aria-hidden>
              {status.type === "success" ? "✓" : "!"}
            </span>
            <h2 id="upload-popup-title" className={formStyles.popupTitle}>
              {status.type === "success"
                ? "Documents Uploaded"
                : "Upload Failed"}
            </h2>
            <p className={formStyles.popupText}>
              {status.type === "success"
                ? `${status.count} document${status.count === 1 ? "" : "s"} uploaded successfully.`
                : status.message}
            </p>
            <div className={formStyles.popupActions}>
              <button
                type="button"
                className={formStyles.primary}
                onClick={() => setStatus({ type: "idle" })}
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadItem({
  index,
  title,
  points,
  file,
  error,
  disabled,
  onChange,
}: {
  index: number;
  title: string;
  points?: Point[];
  file: File | null;
  error: string;
  disabled: boolean;
  onChange: (file: File | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `upload-${index}`;
  const bodyId = `upload-details-${index}`;
  const hasDetails = !!points?.length;

  return (
    <li
      className={`${summaryStyles.doc} ${open ? summaryStyles.docOpen : ""} ${
        file ? styles.docDone : ""
      }`}
    >
      <div className={styles.docRow}>
        <span className={`${summaryStyles.docNum} ${file ? styles.numDone : ""}`}>
          {file ? "✓" : index}
        </span>
        <span className={summaryStyles.docTitle}>{title}</span>
        {hasDetails && (
          <button
            type="button"
            className={styles.detailsBtn}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Hide details" : "Details"}
            <span className={summaryStyles.docChevron}>
              <Icon name="chevron" />
            </span>
          </button>
        )}
      </div>

      {hasDetails && (
        <div id={bodyId} className={summaryStyles.docBody}>
          <div inert={!open}>
            <ul className={summaryStyles.docPoints}>
              {points!.map((p) =>
                typeof p === "string" ? (
                  <li key={p}>{p}</li>
                ) : (
                  <li key={p.text}>
                    {p.text}
                    <ul>
                      {p.sub.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.uploadArea}>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className={styles.fileInput}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.files?.[0] ?? null);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />

        {file ? (
          <div className={styles.fileChip}>
            <Icon name="file" />
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{formatSize(file.size)}</span>
            <button
              type="button"
              className={styles.linkBtn}
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className={styles.removeBtn}
              aria-label={`Remove ${file.name}`}
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <Icon name="x" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!disabled) onChange(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <Icon name="upload" />
            <span>
              <strong>Choose file</strong> or drag it here
            </span>
          </label>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
