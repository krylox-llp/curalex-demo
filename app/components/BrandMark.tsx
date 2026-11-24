import styles from "./BrandMark.module.scss";

/** Shield + medical cross logo with the product name. */
export default function BrandMark({
  tone = "dark",
  showName = true,
}: {
  tone?: "dark" | "light";
  showName?: boolean;
}) {
  return (
    <span className={`${styles.brand} ${tone === "light" ? styles.light : ""}`}>
      <svg viewBox="0 0 32 32" className={styles.mark} aria-hidden>
        <path
          d="M16 2.5 4.5 6.8v8.4c0 7.2 4.9 12.4 11.5 14.3 6.6-1.9 11.5-7.1 11.5-14.3V6.8z"
          className={styles.shield}
        />
        <path
          d="M13.6 9.5h4.8v4.3h4.3v4.8h-4.3v4.3h-4.8v-4.3H9.3v-4.8h4.3z"
          className={styles.cross}
        />
      </svg>
      {showName && (
        <span className={styles.name}>
          Cura<span>Lex</span>
        </span>
      )}
    </span>
  );
}
