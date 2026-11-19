"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CountrySelect from "./CountrySelect";
import styles from "./RegisterForm.module.scss";
import rocketImg from "../assets/rocket.svg";
import quickStatsImg from "../assets/star.svg";
import clipboardImg from "../assets/clipboard.svg";
import trophyImg from "../assets/trophy.svg";
import Image from "next/image";

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
  const overallRef = useRef<HTMLElement>(null);

  const name = displayName(email);
  const initial = name.charAt(0).toUpperCase() || "U";

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
    {
      label: "In Progress",
      value: inProcess,
      variant: styles.inProgress,
      icon: <ClockIcon />,
    },
    {
      label: "Completed",
      value: completed,
      variant: styles.completed,
      icon: <CheckIcon />,
    },
    {
      label: "Failed",
      value: failed,
      variant: styles.failed,
      icon: <AlertIcon />,
    },
  ];

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <LogoIcon className={styles.logo} />
          <h1 className={styles.brand}>Dashboard</h1>
          <p className={styles.userName} title={email}>
            {name}
          </p>
        </div>

        <nav className={styles.nav}>
          <span
            className={`${styles.navItem} ${styles.navItemActive}`}
            aria-current="page"
          >
            <HomeIcon />
            Dashboard
          </span>
          <button
            type="button"
            onClick={handleImport}
            aria-disabled={!country}
            aria-describedby={error ? "import-error" : undefined}
            className={`${styles.navItem} ${!country ? styles.navItemDisabled : ""}`}
          >
            <DocIcon />
            Import Registration
          </button>
          {error && (
            <p id="import-error" role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </nav>

        <div className={styles.sidebarArt} aria-hidden>
          <GrowthIcon />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.blob} aria-hidden />

        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.bell}
            aria-label="Notifications"
          >
            <BellIcon />
            <span className={styles.bellDot} />
          </button>
          <span className={styles.divider} aria-hidden />
          <div className={styles.countryWrap}>
            <GlobeIcon className={styles.globe} />
            <CountrySelect value={country} onChange={handleCountryChange} />
          </div>
          <span className={styles.avatar} title={email}>
            {initial}
          </span>
        </div>

        <header className={styles.header}>
          <div className={styles.heroIcon} aria-hidden>
            <Image src={clipboardImg} alt="Clipboard" width={48} height={48} />
          </div>
          <div className={styles.headText}>
            <h2 className={styles.title}>Progress Summary</h2>
            <p className={styles.subtitle}>Track your progress at a glance </p>
          </div>
          <span className={styles.totalChip}>
            <DbIcon />
            Total records: <strong>{total}</strong>
          </span>
        </header>

        <section className={styles.cards}>
          {items.map((it) => (
            <div key={it.label} className={`${styles.card} ${it.variant}`}>
              <Ring percent={pct(it.value, total)} />
              <div className={styles.cardText}>
                <span className={styles.label}>{it.label}</span>
                <span className={styles.count}>{it.value} records</span>
              </div>
              <span className={styles.badge} aria-hidden>
                {it.icon}
              </span>
              <span className={styles.wave} aria-hidden />
            </div>
          ))}
        </section>

        {/* Overall progress */}
        <section className={styles.overall} ref={overallRef}>
          <div className={styles.trophy} aria-hidden>
            <Image src={trophyImg} alt="Trophy" width={48} height={48} />
          </div>
          <div className={styles.overallBody}>
            <div className={styles.lineHead}>
              <span className={styles.lineTitle}>
                <BarsIcon />
                Overall Progress
              </span>
              <span className={styles.recordsChip}>{total} records</span>
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
                    style={{
                      width: `${total ? (it.value / total) * 100 : 0}%`,
                    }}
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
        </section>

        {/* Bottom row */}
        <section className={styles.bottom}>
          <div className={styles.quick}>
            <h3 className={styles.quickTitle}>
              <span aria-hidden>
                <Image
                  src={quickStatsImg}
                  alt="Quick Stats"
                  width={24}
                  height={24}
                />
              </span>{" "}
              Quick Stats
            </h3>
            <div className={styles.quickGrid}>
              <div className={styles.quickItem}>
                <span className={`${styles.quickIcon} ${styles.qBlue}`}>
                  <DocIcon />
                </span>
                <strong>{total}</strong>
                <span>Total Records</span>
              </div>
              <div className={styles.quickItem}>
                <span className={`${styles.quickIcon} ${styles.qGreen}`}>
                  <CheckIcon />
                </span>
                <strong>{completed}</strong>
                <span>Completed</span>
              </div>
              <div className={styles.quickItem}>
                <span className={`${styles.quickIcon} ${styles.qRed}`}>
                  <AlertIcon />
                </span>
                <strong>{failed}</strong>
                <span>Failed</span>
              </div>
            </div>
          </div>

          <div className={styles.cta}>
            <div className={styles.ctaText}>
              <h3>Keep Going!</h3>
              <p>You&apos;re doing great. Complete more records!</p>
              <button
                type="button"
                className={styles.ctaBtn}
                onClick={() =>
                  overallRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Details <span aria-hidden>→</span>
              </button>
            </div>
            <div className={styles.rocket} aria-hidden>
              <Image
                src={rocketImg}
                alt="Rocket"
                width={80}
                height={80}
                className={styles.rocketImg}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
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
      <span className={styles.percent}>
        {percent}
        <small>%</small>
      </span>
    </div>
  );
}

type IconProps = { className?: string };
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function LogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 36" className={className} fill="none">
      <rect x="2" y="26" width="7" height="8" rx="2" fill="#8ff0c4" />
      <rect x="13" y="20" width="7" height="14" rx="2" fill="#5fe0a8" />
      <rect x="24" y="14" width="7" height="20" rx="2" fill="#3fd394" />
      <rect x="35" y="4" width="7" height="30" rx="2" fill="#22c47f" />
      <path
        d="M3 18 L15 11 L24 14 L38 3"
        stroke="#8ff0c4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 2.5 11h2.5v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9h2.5z" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg {...svgProps}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg {...svgProps}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function DbIcon() {
  return (
    <svg {...svgProps}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...svgProps} strokeWidth={3}>
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0" />
      <path
        d="M12 9v4M12 17h.01"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function BarsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="12" width="4" height="9" rx="1" fill="#1d6ff2" />
      <rect x="10" y="6" width="4" height="15" rx="1" fill="#ef3340" />
      <rect x="17" y="9" width="4" height="12" rx="1" fill="#f5a524" />
    </svg>
  );
}
function GrowthIcon() {
  return (
    <svg viewBox="0 0 120 100" fill="none">
      <rect x="8" y="62" width="14" height="30" rx="3" fill="currentColor" />
      <rect x="34" y="50" width="14" height="42" rx="3" fill="currentColor" />
      <rect x="60" y="38" width="14" height="54" rx="3" fill="currentColor" />
      <rect x="86" y="22" width="14" height="70" rx="3" fill="currentColor" />
      <path
        d="M6 52 34 30l18 8L98 6"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M84 4h16v16"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
