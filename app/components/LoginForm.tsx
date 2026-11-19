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
      <h1 className={styles.title}>Welcome !</h1>
      <p className={styles.subtitle}>
        Sign in securely with your Google account
      </p>

      <GoogleButton />
    </>
  );
}
