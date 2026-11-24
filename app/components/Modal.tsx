"use client";

// Modal pop-up built on the native <dialog> element. showModal() puts it in
// the top layer, makes the rest of the page inert, traps focus and closes on
// Esc; closedby="any" adds backdrop light-dismiss (with a click fallback for
// browsers that don't support it yet). Focus returns to the opener on unmount.
import { useLayoutEffect, useRef } from "react";
import styles from "./Modal.module.scss";

export default function Modal({
  labelledBy,
  alert = false,
  className,
  returnFocusTo,
  onClose,
  children,
}: {
  labelledBy: string;
  /** Use role="alertdialog" (errors / warnings that need a response). */
  alert?: boolean;
  /** Classes for the visible panel inside the dialog. */
  className?: string;
  /** Where focus goes on close when the opener can't take it back (e.g. a
   * submit button that was disabled while the request ran). */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const returnRef = useRef(returnFocusTo);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
    returnRef.current = returnFocusTo;
  });

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const active = document.activeElement;
    const opener =
      active instanceof HTMLElement && active !== document.body ? active : null;

    // Esc / closedby / form method="dialog" all end in a "close" event
    // "close" is dispatched async; skip a stale one queued by an earlier
    // close() (e.g. StrictMode's effect re-run) once the dialog is open again
    const handleClose = () => {
      if (!dialog.open) onCloseRef.current();
    };
    dialog.addEventListener("close", handleClose);

    dialog.showModal();
    // React's autoFocus doesn't render the attribute showModal() looks for
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
      // After the commit, so a button re-enabled in the same render can focus
      setTimeout(() => {
        const target = opener?.isConnected
          ? opener
          : returnRef.current?.current;
        target?.focus();
      });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      role={alert ? "alertdialog" : undefined}
      aria-labelledby={labelledBy}
      className={styles.dialog}
      {...({ closedby: "any" } as object)}
      // Fallback light-dismiss: a click on the ::backdrop targets the dialog
      // itself (the dialog has no padding, so content clicks hit children)
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className={className}>{children}</div>
    </dialog>
  );
}
