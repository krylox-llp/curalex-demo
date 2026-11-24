import Image from "next/image";
import bgImage from "../assets/pharmaBackImg.png";
import BrandMark from "./BrandMark";
import { Icon } from "./Icon";
import styles from "./AuthLayout.module.scss";

const TRUST_POINTS = [
  { icon: "shield", text: "Secure Google sign-in" },
  { icon: "check", text: "Regulatory-aligned workflow" },
  { icon: "file", text: "Market-specific document checklists" },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.formPanel}>
        <header className={styles.brandRow}>
          <BrandMark />
        </header>

        <div className={styles.card}>{children}</div>

        <footer className={styles.footer}>
          CuraLex · For authorised manufacturer and regulatory personnel
        </footer>
      </section>

      <aside className={styles.visual} aria-hidden>
        <Image
          src={bgImage}
          alt=""
          fill
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
          className={styles.bg}
          sizes="(min-width: 1024px) 55vw, 0px"
        />
        <div className={styles.overlay} />
        <div className={styles.visualContent}>
          <span className={styles.eyebrow}>
            Export registration &amp; compliance
          </span>
          <h2 className={styles.visualTitle}>
            Collect and verify product information before dossier compilation.
          </h2>
          <ul className={styles.trustList}>
            {TRUST_POINTS.map((p) => (
              <li key={p.text}>
                <span className={styles.trustIcon}>
                  <Icon name={p.icon} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
