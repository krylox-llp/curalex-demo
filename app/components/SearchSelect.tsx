"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./SearchSelect.module.scss";

type Props = {
  id?: string;
  options: string[];
  /** Selected values. Single mode uses at most one entry. */
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  /** Let the user add a value that is not in the options list. */
  allowCustom?: boolean;
  placeholder?: string;
  invalid?: boolean;
};

export default function SearchSelect({
  id,
  options,
  value,
  onChange,
  multiple = false,
  allowCustom = false,
  placeholder = "Search…",
  invalid = false,
}: Props) {
  const listId = useId();
  const [query, setQuery] = useState(multiple ? "" : (value[0] ?? ""));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    const q = trimmed.toLowerCase();
    return options.filter(
      (o) => o.toLowerCase().includes(q) && !(multiple && value.includes(o)),
    );
  }, [options, trimmed, multiple, value]);

  const canAddCustom =
    allowCustom &&
    trimmed !== "" &&
    !options.some((o) => o.toLowerCase() === trimmed.toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === trimmed.toLowerCase());
  const entries = canAddCustom ? [...filtered, trimmed] : filtered;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      // Single mode: drop text that was typed but never picked
      if (!multiple) setQuery(value[0] ?? "");
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [multiple, value]);

  function choose(v: string) {
    if (multiple) {
      onChange([...value, v]);
      setQuery("");
      setActive(0);
    } else {
      onChange([v]);
      setQuery(v);
      setOpen(false);
    }
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, entries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && entries[active]) {
        e.preventDefault();
        choose(entries[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (
      e.key === "Backspace" &&
      multiple &&
      query === "" &&
      value.length
    ) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div className={styles.combo} ref={boxRef}>
      <div className={`${styles.control} ${invalid ? styles.invalid : ""}`}>
        {multiple &&
          value.map((v) => (
            <span key={v} className={styles.chip}>
              {v}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove ${v}`}
                onClick={() => remove(v)}
              >
                ×
              </button>
            </span>
          ))}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          className={styles.input}
          placeholder={multiple && value.length ? "" : placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!multiple && value.length) onChange([]);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </div>

      {open && (
        <ul id={listId} role="listbox" className={styles.list}>
          {entries.length === 0 ? (
            <li className={styles.empty}>No matches</li>
          ) : (
            entries.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={value.includes(o)}
                className={`${styles.option} ${i === active ? styles.optionActive : ""} ${
                  value.includes(o) ? styles.optionSelected : ""
                }`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
              >
                {canAddCustom && i === entries.length - 1 ? `Add “${o}”` : o}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
