"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CountrySelect.module.scss";

export const COUNTRIES = ["NIGERIA"];

type Props = {
  value: string;
  onChange: (country: string) => void;
};

export default function CountrySelect({ value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      COUNTRIES.filter((c) =>
        c.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  console.log(
    "CountrySelect - value:",
    value,
    "query:",
    query,
    "filtered:",
    filtered,
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(c: string) {
    onChange(c);
    setQuery(c);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={styles.combo} ref={boxRef}>
      <input
        id="country"
        type="text"
        role="combobox"
        aria-label="Country"
        aria-expanded={open}
        aria-controls="country-list"
        autoComplete="off"
        placeholder="Select country"
        className={styles.input}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange("");
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

      {open && (
        <ul id="country-list" role="listbox" className={styles.list}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>No countries found</li>
          ) : (
            filtered.map((c, i) => (
              <li
                key={c}
                role="option"
                aria-selected={c === value}
                className={`${styles.option} ${i === active ? styles.optionActive : ""} ${
                  c === value ? styles.optionSelected : ""
                }`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
              >
                {c}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
