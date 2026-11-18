"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleButton from "./GoogleButton";
import styles from "./LoginForm.module.scss";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  console.log("Email:", email); 

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(`/register?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <>
      <h1 className={styles.title}>Welcome</h1>
      <p className={styles.subtitle}>Log in or sign up to continue</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="email" className={styles.label}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          className={styles.submit}
        >
          Continue
        </button>
      </form>

      <div className={styles.divider}>
        <span />
        OR
        <span />
      </div>

      <GoogleButton />
    </>
  );
}
