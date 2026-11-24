import Link from "next/link";
import BrandMark from "./BrandMark";
import Flag from "./Flag";
import LogoutButton from "./LogoutButton";
import styles from "./AppBar.module.scss";

/** Sticky top bar for workflow pages: brand, back link, target market, log out. */
export default function AppBar({
  country,
  back,
}: {
  country?: string;
  back?: { href: string; label: string };
}) {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <BrandMark />
          {back && (
            <>
              <span className={styles.sep} aria-hidden />
              <Link href={back.href} className={styles.back}>
                <span aria-hidden>←</span> {back.label}
              </Link>
            </>
          )}
        </div>
        <div className={styles.right}>
          {country !== undefined && (
            <div className={styles.market}>
              <span className={styles.marketLabel}>Target market</span>
              <span className={styles.marketValue}>
                {country ? <Flag country={country} /> : null}
                {country || "Not selected"}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
