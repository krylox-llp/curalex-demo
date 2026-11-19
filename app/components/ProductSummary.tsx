"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { PRODUCT_STORAGE_KEY } from "./ProductForm";
import formStyles from "./ProductForm.module.scss";
import styles from "./ProductSummary.module.scss";
import { Icon, type IconName } from "./Icon";
import LoadingScreen from "./LoadingScreen";
import { REGULATORY_DOCS } from "../data/regulatoryDocs";

type Payload = Record<string, string | string[] | undefined>;

// ---------- Helpers ----------
function readStored(): string | null {
  try {
    return sessionStorage.getItem(PRODUCT_STORAGE_KEY);
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------- Component ----------
export default function ProductSummary({ country }: { country: string }) {
  // Read the saved form once on the client (null during server render)
  const raw = useSyncExternalStore(
    () => () => {},
    readStored,
    () => null,
  );
  let data: Payload | null = null;
  try {
    data = raw ? (JSON.parse(raw) as Payload) : null;
  } catch {
    data = null;
  }

  const [open, setOpen] = useState<string[]>(["basic"]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError =
    emailTouched && !emailValid
      ? email.trim()
        ? "Enter a valid email address"
        : "Email ID is required"
      : "";
  const canSend = !!data && acknowledged && emailValid;

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const back = `/import-register?country=${encodeURIComponent(country)}`;

  const [status, setStatus] = useState<
    | { type: "idle" | "sending" }
    | { type: "success"; to: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  async function handleRequestEmail() {
    if (!canSend || status.type === "sending") return;
    const to = email.trim();
    setStatus({ type: "sending" });
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, country }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to send email");
      setStatus({ type: "success", to });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send email",
      });
    }
  }

  const closePopup = () => setStatus({ type: "idle" });

  return (
    <div className={formStyles.page}>
      <header className={formStyles.header}>
        <div>
          <Link href={back} className={formStyles.back}>
            ← Back to form
          </Link>
          <h1 className={formStyles.title}>Product Summary</h1>
          <p className={formStyles.subtitle}>
            Review the submitted registration details.
          </p>
        </div>
        <span className={formStyles.countryBadge}>
          Country: <strong>{country || "Not selected"}</strong>
        </span>
      </header>

      <div className={styles.card}>
        {!data ? (
          <p className={styles.empty}>
            No submitted product found. Please fill the form first.
          </p>
        ) : (
          <>
            <Section
              id="regulatory"
              title="Documents required for product registration with NAFDAC:"
              icon="file"
              open={open.includes("regulatory")}
              onToggle={toggle}
            >
              <ol className={styles.docList}>
                {REGULATORY_DOCS.map((doc, i) => (
                  <DocAccordion key={doc.title} index={i + 1} doc={doc} />
                ))}
              </ol>
            </Section>

            <Section
              id="declaration"
              title="Declaration & Acknowledgement"
              icon="check"
              open={open.includes("declaration")}
              onToggle={toggle}
            >
              <div className={styles.declaration}>
                <p>
                  I/We hereby declare that the information provided in this
                  application is true, complete and accurate to the best of
                  my/our knowledge.
                </p>
                <p>
                  I/We understand that providing false or misleading information
                  may lead to rejection of the application or cancellation of
                  the registration.
                </p>
                <p>
                  I/We undertake to submit all supporting documents listed under
                  Regulatory Information.
                </p>

                <div className={styles.emailField}>
                  <label htmlFor="ackEmail" className={styles.emailLabel}>
                    Trade Owner Email ID{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div
                    className={`${styles.emailInputWrap} ${emailError ? styles.emailInvalid : ""}`}
                  >
                    <Icon name="mail" />
                    <input
                      id="ackEmail"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Enter here"
                      value={email}
                      aria-invalid={!!emailError || undefined}
                      aria-describedby={
                        emailError ? "ackEmail-error" : undefined
                      }
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                    />
                  </div>
                  {emailError && (
                    <p id="ackEmail-error" className={styles.emailError}>
                      {emailError}
                    </p>
                  )}
                </div>

                <label className={styles.ack}>
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  I have read and agree to the above declaration.
                </label>
              </div>
            </Section>
          </>
        )}
      </div>

      <div className={styles.actions}>
        {data && !canSend && (
          <span className={styles.hint}>
            Enter your email ID and accept the declaration to request email.
          </span>
        )}
        <Link href={back} className={`${styles.btn} ${styles.btnSecondary}`}>
          <Icon name="pencil" />
          Edit
        </Link>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!canSend || status.type === "sending"}
          onClick={handleRequestEmail}
        >
          <Icon name="mail" />
          Request Document
        </button>
      </div>

      {status.type === "sending" && (
        <LoadingScreen text="Please wait while we send your email" />
      )}

      {(status.type === "success" || status.type === "error") && (
        <div className={formStyles.overlay} onClick={closePopup}>
          <div
            role={status.type === "error" ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby="email-popup-title"
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
            <h2 id="email-popup-title" className={formStyles.popupTitle}>
              {status.type === "success" ? "Email Sent" : "Email Not Sent"}
            </h2>
            <p className={formStyles.popupText}>
              {status.type === "success" ? (
                <>
                  Please check your Trade Owner email
                  <br />
                  <strong>{status.to}</strong>
                </>
              ) : (
                status.message
              )}
            </p>
            <div className={formStyles.popupActions}>
              <button
                type="button"
                className={formStyles.primary}
                onClick={closePopup}
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

function Section({
  id,
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: IconName;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`${styles.section} ${open ? styles.sectionOpen : ""}`}>
      <button
        type="button"
        className={styles.sectionHeader}
        aria-expanded={open}
        aria-controls={`section-${id}`}
        onClick={() => onToggle(id)}
      >
        <span className={styles.sectionIcon}>
          <Icon name={icon} />
        </span>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.chevron}>
          <Icon name="chevron" />
        </span>
      </button>
      <div id={`section-${id}`} className={styles.sectionBody}>
        <div inert={!open}>{children}</div>
      </div>
    </section>
  );
}

function DocAccordion({
  index,
  doc,
}: {
  index: number;
  doc: (typeof REGULATORY_DOCS)[number];
}) {
  const [open, setOpen] = useState(false);
  const hasDetails = !!doc.points?.length;
  const bodyId = `doc-${index}`;

  const heading = (
    <>
      <span className={styles.docNum}>{index}</span>
      <span className={styles.docTitle}>{doc.title}</span>
    </>
  );

  return (
    <li className={`${styles.doc} ${open ? styles.docOpen : ""}`}>
      {hasDetails ? (
        <button
          type="button"
          className={styles.docHeader}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
        >
          {heading}
          <span className={styles.docChevron}>
            <Icon name="chevron" />
          </span>
        </button>
      ) : (
        <div className={styles.docHeader}>{heading}</div>
      )}

      {hasDetails && (
        <div id={bodyId} className={styles.docBody}>
          <div inert={!open}>
            <ul className={styles.docPoints}>
              {doc.points!.map((p) =>
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
    </li>
  );
}
