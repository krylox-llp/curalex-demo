import styles from "./Flag.module.scss";

// Inline SVG flags (emoji flags don't render on Windows).
const FLAGS: Record<string, React.ReactNode> = {
  NIGERIA: (
    <>
      <rect width="3" height="2" fill="#fff" />
      <rect width="1" height="2" fill="#008751" />
      <rect x="2" width="1" height="2" fill="#008751" />
    </>
  ),
};

export const FLAG_CODES: Record<string, string> = { NIGERIA: "NG" };

export default function Flag({
  country,
  size = "md",
}: {
  country: string;
  size?: "sm" | "md" | "lg";
}) {
  const key = country.trim().toUpperCase();
  const art = FLAGS[key];
  return (
    <span className={`${styles.flag} ${styles[size]}`} aria-hidden>
      {art ? (
        <svg viewBox="0 0 3 2" preserveAspectRatio="none">
          {art}
        </svg>
      ) : (
        <span className={styles.code}>{FLAG_CODES[key] ?? "··"}</span>
      )}
    </span>
  );
}
