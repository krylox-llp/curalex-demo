"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { PRODUCT_STORAGE_KEY } from "./ProductForm";
import styles from "./ProductForm.module.scss";

type Payload = Record<string, string | string[]>;

const LABELS: Record<string, string> = {
  productClass: "Product Class",
  category: "Category",
  brandName: "Brand Name",
  genericName: "Excipients (INN)",
  apis: "API(s)",
  manufacturer: "Manufacturer / Factory",
  strengths: "Strength(s)",
  packSizes: "Pack Sizes",
  dosageForm: "Dosage Form",
  route: "Route",
  trademarkOwner: "Trademark Owner",
};

function readStored(): string | null {
  try {
    return sessionStorage.getItem(PRODUCT_STORAGE_KEY);
  } catch {
    return null;
  }
}

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

  const back = `/import-register?country=${encodeURIComponent(country)}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href={back} className={styles.back}>
            ← Back to form
          </Link>
          <h1 className={styles.title}>Product Summary</h1>
          <p className={styles.subtitle}>
            Review the submitted registration details.
          </p>
        </div>
        <span className={styles.countryBadge}>
          Country: <strong>{country || "Not selected"}</strong>
        </span>
      </header>

      <div className={styles.card}>
        {data ? (
          <dl className={styles.summaryGrid}>
            {Object.entries(LABELS).map(([key, label]) => {
              const v = data[key];
              const text = Array.isArray(v) ? v.join(", ") : v;
              return (
                <div key={key} className={styles.summaryItem}>
                  <dt>{label}</dt>
                  <dd>{text || "—"}</dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <p className={styles.subtitle}>
            No submitted product found. Please fill the form first.
          </p>
        )}

        <div className={styles.actions}>
          <Link href={back} className={styles.secondary}>
            Edit
          </Link>
          <Link href="/register" className={styles.primary}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
