"use client";

import GoogleButton from "./GoogleButton";
import { Icon } from "./Icon";
import styles from "./LoginForm.module.scss";

export default function LoginForm() {
  return (
    <>
      <span className={styles.eyebrow}>Secure access</span>
      <h1 className={styles.title}>Sign in to your workspace</h1>
      <p className={styles.subtitle}>
        Manage product registrations, compliance checks and registration
        documents for your export markets.
      </p>

      <GoogleButton />

      <p className={styles.note}>
        <Icon name="shield" />
        Authentication is handled by Google. We never see or store your
        password.
      </p>
    </>
  );
}
