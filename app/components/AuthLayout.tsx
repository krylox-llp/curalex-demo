import Image from "next/image";
import bgImage from "../assets/pharmaBackImg.png";
import styles from "./AuthLayout.module.scss";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <Image
        src={bgImage}
        alt=""
        fill
        placeholder="blur"
        loading="eager"
        fetchPriority="high"
        className={styles.bg}
        sizes="100vw"
      />
      {/* Soft overlay so the form stays readable on small screens */}
      <div className={styles.overlay} />

      <div className={styles.card}>{children}</div>
    </div>
  );
}
