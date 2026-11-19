"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchSelect from "./SearchSelect";
import styles from "./ProductForm.module.scss";

// Demo master data — replace with API data later
const PRODUCT_CLASSES = ["Human", "Veterinary"];
const CATEGORIES = ["NCE", "Generic", "Combination"];
const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Suspension",
];
const ROUTES = ["Oral", "IV", "IM", "SC", "Topical", "Inhalation"];
const MOLECULES_API = [
  "Abacavir (sulfate)",
  "Albendazole",
  "Amodiaquine (hydrochloride)",
  "Artemether",
  "Artesunate",
  "Artesunate (sterile)",
  "Atazanavir (sulfate)",
  "Bedaquiline (fumarate)",
  "Bedaquiline fumarate",
  "Cabotegravir (sodium)",
  "Carbetocin",
  "Clofazimine",
  "Cycloserine",
  "Daclatasvir (dihydrochloride)",
  "Darunavir",
  "Darunavir (ethanolate)",
  "Delamanid",
  "Desogestrel",
  "Dihydroartemisinin",
  "Dolutegravir (sodium)",
  "Efavirenz",
  "Emtricitabine",
  "Ethambutol hydrochloride",
  "Ethinylestradiol",
  "Ethionamide",
  "Flucytosine",
  "Isoniazid",
  "Lamivudine",
  "Levofloxacin",
  "Levonorgestrel",
  "Linezolid",
  "Lopinavir",
  "Lumefantrine",
  "Mebendazole",
  "Medroxyprogesterone acetate",
  "Medroxyprogesterone acetate - Sterile",
  "Mifepristone",
  "Miltefosine",
  "Misoprostol Dispersion (1:100 in HPMC)",
  "Molnupiravir",
  "Nevirapine",
  "Nirmatrelvir",
  "Oseltamivir (phosphate)",
  "Oxytocin",
  "Para-aminosalicylate (sodium)",
  "Piperaquine phosphate",
  "Praziquantel",
  "Protionamide",
  "Pyrazinamide",
  "Pyrimethamine",
  "Pyronaridine (phosphate)",
  "Rifampicin",
  "Rifapentine",
  "Ritonavir",
  "Sofosbuvir",
  "Sulfadoxine",
  "Tenofovir alafenamide",
  "Tenofovir disoproxil fumarate",
  "Tranexamic acid",
  "Velpatasvir",
  "Zidovudine",
  "Zinc (sulfate)",
];

async function fetchSmartApi(inn: string): Promise<string[]> {
  console.log("smart-api request:", { inn });
  try {
    const res = await fetch("/api/smart-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inn }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`smart-api error (${inn}):`, res.status, json);
      return [];
    }
    const rows: { id: number; name: string }[] = json?.data ?? [];
    console.log(`smart-api response for "${inn}":`, json);
    console.table(rows.map(({ id, name }) => ({ id, name })));
    return rows.map((r) => r.name).filter(Boolean);
  } catch (err) {
    console.error("smart-api error:", err);
    return [];
  }
}

function manufacturersFor(apis: string[], byApi: Record<string, string[]>) {
  return [...new Set(apis.flatMap((a) => byApi[a] ?? []))];
}

const MOLECULES = [
  "Ethylalcohol (ethanol)",
  "Glycerol",
  "Hydrogenated starch hydrolysate",
  "Isopropyl alcohol (IPA) (See ethylalcohol)",
  "Maltitol",
  "Propylene glycol",
  "Sorbitol",
  "Polyethylene Glycol",
  "Diethylene Glycol Stearates",
  "Polyethylene Glycol Monomethyl Ether",
];
const COMPANIES = [
  "Cipla Ltd",
  "Dr. Reddy's Laboratories",
  "Lupin Ltd",
  "Micro Labs Ltd",
  "Micro Labs Ltd — Bangalore Factory",
  "Sun Pharmaceutical Industries",
  "Zydus Lifesciences",
];

type FormState = {
  productClass: string;
  category: string;
  brandName: string;
  genericName: string[];
  apis: string[];
  strengths: string[];
  dosageForm: string;
  route: string;
  packSizes: string[];
  manufacturer: string[];
  trademarkOwner: string[];
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  productClass: "",
  category: "",
  brandName: "",
  genericName: [],
  apis: [],
  strengths: [""],
  dosageForm: "",
  route: "",
  packSizes: [""],
  manufacturer: [],
  trademarkOwner: [],
};

const WARNING_RULES: {
  field: "genericName" | "apis";
  value: string;
  message: string;
}[] = [
  {
    field: "genericName",
    value: "Glycerol",
    message:
      "Sampling and testing of raw materials and excipients can be used to detect the presence of DEG.",
  },
  {
    field: "apis",
    value: "Albendazole",
    message: "API Albendazole is in NAFDAC ceiling list.",
  },
];

function getWarnings(f: FormState): string[] {
  return WARNING_RULES.filter((r) =>
    f[r.field].some((v) => v.trim().toLowerCase() === r.value.toLowerCase()),
  ).map((r) => r.message);
}

export const PRODUCT_STORAGE_KEY = "importRegisterProduct";

type Popup = { type: "warning"; messages: string[] } | { type: "success" };

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.productClass) e.productClass = "Select a product class";
  if (!f.category) e.category = "Select a category";
  if (!f.brandName.trim()) e.brandName = "Enter the brand name";
  if (!f.genericName.length) e.genericName = "Select or enter the generic name";
  if (!f.apis.length) e.apis = "Select at least one API";
  if (!f.strengths.some((s) => s.trim()))
    e.strengths = "Enter at least one strength";
  if (!f.dosageForm) e.dosageForm = "Select a dosage form";
  if (!f.route) e.route = "Select a route";
  if (!f.packSizes.some((s) => s.trim()))
    e.packSizes = "Enter at least one pack size";
  if (!f.manufacturer.length)
    e.manufacturer = "Select the manufacturer / factory";
  if (!f.trademarkOwner.length) e.trademarkOwner = "Select the trademark owner";
  return e;
}

export default function ProductForm({ country }: { country: string }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [popup, setPopup] = useState<Popup | null>(null);
  const [manufacturersByApi, setManufacturersByApi] = useState<
    Record<string, string[]>
  >({});
  const [loadingApis, setLoadingApis] = useState<string[]>([]);
  const manufacturerOptions = manufacturersFor(form.apis, manufacturersByApi);
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const warnings = getWarnings(form);
    if (warnings.length) {
      setPopup({ type: "warning", messages: warnings });
      return;
    }

    const payload = {
      country,
      ...form,
      genericName: form.genericName[0],
      manufacturer: form.manufacturer[0],
      trademarkOwner: form.trademarkOwner[0],
      strengths: form.strengths.map((s) => s.trim()).filter(Boolean),
      packSizes: form.packSizes.map((s) => s.trim()).filter(Boolean),
    };
    console.log("Register product:", payload);
    try {
      sessionStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    setPopup({ type: "success" });
  }

  function handleNext() {
    setPopup(null);
    router.push(
      `/import-register/summary?country=${encodeURIComponent(country)}`,
    );
  }

  function handleApisChange(apis: string[]) {
    set("apis", apis);

    const remaining = manufacturersFor(apis, manufacturersByApi);
    if (form.manufacturer.length && !remaining.includes(form.manufacturer[0])) {
      set("manufacturer", []);
    }

    apis
      .filter((inn) => !form.apis.includes(inn) && !manufacturersByApi[inn])
      .forEach(async (inn) => {
        setLoadingApis((l) => [...l, inn]);
        const names = await fetchSmartApi(inn);
        setManufacturersByApi((m) => ({ ...m, [inn]: names }));
        setLoadingApis((l) => l.filter((x) => x !== inn));
      });
  }

  function handleReset() {
    setForm(EMPTY);
    setErrors({});
    setPopup(null);
    setFormKey((k) => k + 1);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/register" className={styles.back}>
            ← Back to dashboard
          </Link>
          <h1 className={styles.title}>Import Register</h1>
          <p className={styles.subtitle}>
            Enter the product registration details.
          </p>
        </div>
        <span className={styles.countryBadge}>
          Country: <strong>{country || "Not selected"}</strong>
        </span>
      </header>

      <form
        key={formKey}
        className={styles.card}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.grid}>
          <Field
            label="Product Class"
            htmlFor="productClass"
            error={errors.productClass}
          >
            <Select
              id="productClass"
              value={form.productClass}
              options={PRODUCT_CLASSES}
              placeholder="Select product class"
              invalid={!!errors.productClass}
              onChange={(v) => set("productClass", v)}
            />
          </Field>

          <Field label="Category" htmlFor="category" error={errors.category}>
            <Select
              id="category"
              value={form.category}
              options={CATEGORIES}
              placeholder="Select category"
              invalid={!!errors.category}
              onChange={(v) => set("category", v)}
            />
          </Field>

          <Field
            label="Brand Name"
            htmlFor="brandName"
            error={errors.brandName}
          >
            <input
              id="brandName"
              type="text"
              className={`${styles.input} ${errors.brandName ? styles.invalid : ""}`}
              placeholder="e.g. Dolo"
              value={form.brandName}
              onChange={(e) => set("brandName", e.target.value)}
            />
          </Field>

          <Field
            label="Excipients (INN)"
            htmlFor="genericName"
            error={errors.genericName}
          >
            <SearchSelect
              id="genericName"
              options={MOLECULES}
              value={form.genericName}
              allowCustom
              placeholder="e.g. Paracetamol"
              invalid={!!errors.genericName}
              onChange={(v) => set("genericName", v)}
            />
          </Field>

          <Field label="API(s)" htmlFor="apis" error={errors.apis} wide>
            <SearchSelect
              id="apis"
              options={MOLECULES_API}
              value={form.apis}
              multiple
              placeholder="Search and select APIs"
              invalid={!!errors.apis}
              onChange={handleApisChange}
            />
          </Field>

          <Field
            label="Manufacturer Name / Factory"
            htmlFor="manufacturer"
            error={errors.manufacturer}
          >
            <SearchSelect
              id="manufacturer"
              options={manufacturerOptions}
              value={form.manufacturer}
              placeholder={
                !form.apis.length
                  ? "Select API(s) first"
                  : loadingApis.some((a) => form.apis.includes(a))
                    ? "Loading manufacturers…"
                    : "Search company / factory"
              }
              invalid={!!errors.manufacturer}
              onChange={(v) => set("manufacturer", v)}
            />
          </Field>

          <Field
            label="Strength(s)"
            htmlFor="strengths-0"
            error={errors.strengths}
          >
            <Repeatable
              idPrefix="strengths"
              values={form.strengths}
              placeholder="e.g. 500 mg"
              addLabel="Add strength"
              invalid={!!errors.strengths}
              onChange={(v) => set("strengths", v)}
            />
          </Field>

          <Field
            label="Pack Sizes"
            htmlFor="packSizes-0"
            error={errors.packSizes}
          >
            <Repeatable
              idPrefix="packSizes"
              values={form.packSizes}
              placeholder="e.g. 10 Tablets"
              addLabel="Add pack size"
              invalid={!!errors.packSizes}
              onChange={(v) => set("packSizes", v)}
            />
          </Field>

          <Field
            label="Dosage Form"
            htmlFor="dosageForm"
            error={errors.dosageForm}
          >
            <Select
              id="dosageForm"
              value={form.dosageForm}
              options={DOSAGE_FORMS}
              placeholder="Select dosage form"
              invalid={!!errors.dosageForm}
              onChange={(v) => set("dosageForm", v)}
            />
          </Field>

          <Field label="Route" htmlFor="route" error={errors.route}>
            <Select
              id="route"
              value={form.route}
              options={ROUTES}
              placeholder="Select route"
              invalid={!!errors.route}
              onChange={(v) => set("route", v)}
            />
          </Field>

          <Field
            label="Trademark Owner"
            htmlFor="trademarkOwner"
            error={errors.trademarkOwner}
          >
            <SearchSelect
              id="trademarkOwner"
              options={COMPANIES}
              value={form.trademarkOwner}
              placeholder="Search company name"
              invalid={!!errors.trademarkOwner}
              onChange={(v) => set("trademarkOwner", v)}
            />
          </Field>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={handleReset}
          >
            Reset
          </button>
          <button type="submit" className={styles.primary}>
            Submit
          </button>
        </div>
      </form>

      {popup && (
        <ResultPopup
          popup={popup}
          country={country}
          onClose={() => setPopup(null)}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

function ResultPopup({
  popup,
  country,
  onClose,
  onNext,
}: {
  popup: Popup;
  country: string;
  onClose: () => void;
  onNext: () => void;
}) {
  const isWarning = popup.type === "warning";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        role={isWarning ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="popup-title"
        className={`${styles.popup} ${isWarning ? styles.popupWarning : styles.popupSuccess}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.popupIcon} aria-hidden>
          {isWarning ? "!" : "✓"}
        </span>
        <h2 id="popup-title" className={styles.popupTitle}>
          {isWarning ? "Warning" : "Success"}
        </h2>

        {isWarning ? (
          <ul className={styles.popupList}>
            {popup.messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.popupText}>
            Product details saved successfully for {country}.
          </p>
        )}

        <div className={styles.popupActions}>
          {isWarning ? (
            <button
              type="button"
              className={styles.primary}
              onClick={onClose}
              autoFocus
            >
              OK
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.secondary}
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={onNext}
                autoFocus
              >
                Next →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  wide,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label} <span className={styles.required}>*</span>
      </label>
      {children}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

function Select({
  id,
  value,
  options,
  placeholder,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  placeholder: string;
  invalid: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.selectWrap}>
      <select
        id={id}
        className={`${styles.input} ${styles.select} ${invalid ? styles.invalid : ""} ${
          value ? "" : styles.placeholder
        }`}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className={styles.chevron} aria-hidden>
        ▾
      </span>
    </div>
  );
}

function Repeatable({
  idPrefix,
  values,
  placeholder,
  addLabel,
  invalid,
  onChange,
}: {
  idPrefix: string;
  values: string[];
  placeholder: string;
  addLabel: string;
  invalid: boolean;
  onChange: (v: string[]) => void;
}) {
  return (
    <div className={styles.repeat}>
      {values.map((v, i) => (
        <div key={i} className={styles.repeatRow}>
          <input
            id={`${idPrefix}-${i}`}
            type="text"
            className={`${styles.input} ${invalid ? styles.invalid : ""}`}
            placeholder={placeholder}
            value={v}
            aria-label={
              i > 0 ? `${addLabel.replace("Add ", "")} ${i + 1}` : undefined
            }
            onChange={(e) =>
              onChange(values.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          {values.length > 1 && (
            <button
              type="button"
              className={styles.removeBtn}
              aria-label={`Remove row ${i + 1}`}
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className={styles.addBtn}
        onClick={() => onChange([...values, ""])}
      >
        + {addLabel}
      </button>
    </div>
  );
}
