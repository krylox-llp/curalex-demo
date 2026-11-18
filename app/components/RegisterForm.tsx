"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CountrySelect from "./CountrySelect";
import styles from "./RegisterForm.module.scss";

type Stats = { total: number; inProcess: number; completed: number; failed: number };

// Initial demo values: 30% in progress, 50% completed, 20% failed
const INITIAL: Stats = { total: 100, inProcess: 30, completed: 50, failed: 20 };

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

export default function RegisterForm({ email: initialEmail }: { email: string }) {
  const router = useRouter();
  // Logged-in email (from Google login or the normal email login), stored in state
  const [email] = useState(initialEmail);
  console.log("Email:", email);
  const [stats] = useState<Stats>(INITIAL);
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");

  function handleImport() {
    if (!country) {
      setError("Please select country");
      return;
    }
    setError("");
    router.push(`/import-register?country=${encodeURIComponent(country)}`);
  }

  function handleCountryChange(c: string) {
    setCountry(c);
    if (c) setError("");
  }

  const { total, inProcess, completed, failed } = stats;
  const items = [
    { label: "In Progress", value: inProcess, variant: styles.inProgress },
    { label: "Completed", value: completed, variant: styles.completed },
    { label: "Failed", value: failed, variant: styles.failed },
  ];

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h1 className={styles.brand}>Dashboard</h1>
        <p className={styles.userEmail} title={email}>
          {email}
        </p>
        <div className={styles.importWrap}>
          <button
            type="button"
            onClick={handleImport}
            aria-disabled={!country}
            aria-describedby={error ? "import-error" : undefined}
            className={`${styles.importBtn} ${!country ? styles.importBtnDisabled : ""}`}
          >
            Import Register
          </button>
          {error && (
            <p id="import-error" role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <CountrySelect value={country} onChange={handleCountryChange} />
        </div>

        <section className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Progress Summary</h1>
            <span className={styles.total}>Total records: {total}</span>
          </div>

          <div className={styles.grid}>
            {items.map((it) => (
              <div key={it.label} className={`${styles.item} ${it.variant}`}>
                <Ring percent={pct(it.value, total)} value={it.value} />
                <div className={styles.pill}>
                  <span className={styles.label}>{it.label}</span>
                  <span className={styles.count}>{it.value} records</span>
                </div>
              </div>
            ))}

            <div className={styles.lineCard}>
              <div className={styles.lineHead}>
                <span className={styles.lineTitle}>Overall Progress</span>
                <span className={styles.count}>{total} records</span>
              </div>
              <div
                className={styles.lineBar}
                role="img"
                aria-label={items.map((it) => `${it.label}: ${it.value}`).join(", ")}
              >
                {items.map((it) =>
                  it.value > 0 ? (
                    <span
                      key={it.label}
                      className={`${styles.lineSeg} ${it.variant}`}
                      style={{ width: `${total ? (it.value / total) * 100 : 0}%` }}
                    />
                  ) : null,
                )}
              </div>
              <ul className={styles.legend}>
                {items.map((it) => (
                  <li key={it.label} className={it.variant}>
                    <span className={styles.dot} />
                    {it.label}
                    <strong>{it.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Ring({ percent, value }: { percent: number; value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className={styles.ring}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} className={styles.track} />
        <circle
          cx="50"
          cy="50"
          r={r}
          className={styles.progress}
          strokeOpacity={percent > 0 ? 1 : 0}
          strokeDasharray={c}
          strokeDashoffset={c - (percent / 100) * c}
        />
      </svg>
      <span className={styles.percent}>{value}</span>
    </div>
  );
}
