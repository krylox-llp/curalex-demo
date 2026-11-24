"use client";

import { useState } from "react";
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import BrandMark from "./BrandMark";
import CountrySelect from "./CountrySelect";
import Flag from "./Flag";
import { Icon, type IconName } from "./Icon";
import styles from "./RegisterForm.module.scss";

type Stats = {
  total: number;
  inProcess: number;
  completed: number;
  failed: number;
};
const INITIAL: Stats = { total: 100, inProcess: 30, completed: 50, failed: 20 };

const pct = (n: number, total: number) =>
  total ? Math.round((n / total) * 100) : 0;

function displayName(email: string) {
  const local = email.split("@")[0] ?? "";
  const clean =
    local
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, "")
      .trim() || local;
  return clean.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function RegisterForm({
  email: initialEmail,
}: {
  email: string;
}) {
  const router = useRouter();
  const [email] = useState(initialEmail);
  const [stats] = useState<Stats>(INITIAL);
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");

  const name = displayName(email);
  const initial = name.charAt(0).toUpperCase() || "U";

  function handleImport() {
    if (!country) {
      setError("Select a target market to start a registration");
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
  const items: {
    label: string;
    hint: string;
    value: number;
    variant: string;
    icon: IconName;
  }[] = [
    {
      label: "In progress",
      hint: "Product details or documents still being collected",
      value: inProcess,
      variant: styles.review,
      icon: "clock",
    },
    {
      label: "Completed",
      hint: "All details and documents collected",
      value: completed,
      variant: styles.registered,
      icon: "check",
    },
    {
      label: "Action required",
      hint: "Queries or rejections to resolve",
      value: failed,
      variant: styles.action,
      icon: "alert",
    },
  ];

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <BrandMark tone="light" />

        <nav className={styles.nav} aria-label="Main">
          <span className={styles.navLabel}>Workspace</span>
          <span
            className={`${styles.navItem} ${styles.navItemActive}`}
            aria-current="page"
          >
            <Icon name="grid" />
            Overview
          </span>
          <button
            type="button"
            onClick={handleImport}
            aria-disabled={!country}
            aria-describedby={error ? "import-error" : undefined}
            className={`${styles.navItem} ${!country ? styles.navItemDisabled : ""}`}
          >
            <Icon name="file" />
            New registration
          </button>
        </nav>

        <div className={styles.userCard}>
          <span className={styles.avatar}>{initial}</span>
          <span className={styles.userText}>
            <strong>{name}</strong>
            <span title={email}>{email}</span>
          </span>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <p className={styles.crumb}>Workspace / Overview</p>
            <h1 className={styles.title}>Registration overview</h1>
          </div>

          <div className={styles.topActions}>
            <div className={styles.market}>
              <label htmlFor="country" className={styles.marketLabel}>
                Target market
              </label>
              <CountrySelect value={country} onChange={handleCountryChange} />
            </div>
            <button
              type="button"
              className={styles.bell}
              aria-label="Notifications"
            >
              <Icon name="bell" />
              <span className={styles.bellDot} />
            </button>
            <LogoutButton />
          </div>
        </div>

        {error && (
          <p id="import-error" role="alert" className={styles.error}>
            <Icon name="alert" />
            {error}
          </p>
        )}

        {/* KPI cards */}
        <section className={styles.cards} aria-label="Registration status">
          {items.map((it) => (
            <div key={it.label} className={`${styles.card} ${it.variant}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>
                  <Icon name={it.icon} />
                </span>
                <span className={styles.cardLabel}>{it.label}</span>
              </div>
              <div className={styles.cardValue}>
                <strong>{it.value}</strong>
                <span>{pct(it.value, total)}% of registrations</span>
              </div>
              <div className={styles.meter}>
                <span style={{ width: `${pct(it.value, total)}%` }} />
              </div>
              <p className={styles.cardHint}>{it.hint}</p>
            </div>
          ))}
        </section>

        {/* Pipeline */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Registration pipeline</h2>
            <span className={styles.chip}>{total} registrations</span>
          </div>
          <div
            className={styles.lineBar}
            role="img"
            aria-label={items
              .map((it) => `${it.label}: ${it.value}`)
              .join(", ")}
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
        </section>

        <section className={styles.bottom}>
          {/* Next actions */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Next actions</h2>
            </div>
            <ul className={styles.tasks}>
              <li className={styles.action}>
                <span className={styles.taskIcon}>
                  <Icon name="alert" />
                </span>
                <span className={styles.taskText}>
                  <strong>{failed} registrations need attention</strong>
                  <span>Resolve flagged items or missing information.</span>
                </span>
              </li>
              <li className={styles.review}>
                <span className={styles.taskIcon}>
                  <Icon name="clock" />
                </span>
                <span className={styles.taskText}>
                  <strong>{inProcess} registrations in progress</strong>
                  <span>
                    Waiting on product details or Trade Owner documents.
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Start registration */}
          <div className={`${styles.panel} ${styles.start}`}>
            <div className={styles.startHead}>
              {country ? (
                <Flag country={country} size="lg" />
              ) : (
                <span className={styles.startIcon}>
                  <Icon name="globe" />
                </span>
              )}
              <div>
                <h2 className={styles.panelTitle}>Start a new registration</h2>
                <p className={styles.startText}>
                  {country
                    ? `Collect product details and documents for ${country}.`
                    : "Choose a target market above to start collecting product details."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleImport}
              aria-disabled={!country}
            >
              New registration <span aria-hidden>→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
