"use client";

// Full-screen loader (spinning arcs + box icon) shown while waiting on a request.
import { Icon } from "./Icon";
import styles from "./LoadingScreen.module.scss";

export default function LoadingScreen({
  title = "Loading...",
  text = "Please wait",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div
      className={styles.loader}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className={styles.loaderRing}>
        <svg viewBox="0 0 100 100" className={styles.loaderArcs} aria-hidden>
          <defs>
            <linearGradient id="loaderGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f4c8a" />
            </linearGradient>
          </defs>
          {/* 4 arc segments: one strong, three faded */}
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="42"
              pathLength={100}
              strokeDasharray="19 81"
              strokeDashoffset={-25 * i}
              className={styles[`arc${i}`]}
            />
          ))}
        </svg>
        <span className={styles.loaderIcon}>
          <Icon name="box" />
        </span>
      </div>
      <p className={styles.loaderTitle}>{title}</p>
      <p className={styles.loaderText}>{text}</p>
      <div className={styles.loaderDots} aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
