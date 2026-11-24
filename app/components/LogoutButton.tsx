"use client";

import { useFormStatus } from "react-dom";
import { logout } from "../actions/auth";
import { Icon } from "./Icon";
import styles from "./LogoutButton.module.scss";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={styles.button}
      disabled={pending}
      aria-label="Log out"
      title="Log out"
    >
      <Icon name="logout" />
      <span className={styles.label}>{pending ? "Logging out…" : "Log out"}</span>
    </button>
  );
}

/** Signs the user out and returns to the login page. */
export default function LogoutButton() {
  return (
    <form
      action={logout}
      onSubmit={() => {
        // Drop the in-progress registration so the next user starts clean.
        try {
          sessionStorage.clear();
        } catch {}
      }}
    >
      <Submit />
    </form>
  );
}
