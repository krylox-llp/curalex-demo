"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SearchSelect from "./SearchSelect";
import LoadingScreen from "./LoadingScreen";
import Modal from "./Modal";
import AppBar from "./AppBar";
import { Icon } from "./Icon";
import { CEILING_LIST_APIS, ceilingMatches } from "../data/ceilingList";
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
const WHO_PQ_APIS = [
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

// Picker options: existing APIs plus every API on the NAFDAC ceiling list
const MOLECULES_API = [...new Set([...WHO_PQ_APIS, ...CEILING_LIST_APIS])].sort(
  (a, b) => a.localeCompare(b),
);

/** Manufacturer names for an API, or null if the lookup failed */
async function fetchSmartApi(inn: string): Promise<string[] | null> {
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
      return null;
    }
    const rows: { id: number; name: string }[] = json?.data ?? [];
    console.log(`smart-api response for "${inn}":`, json);
    console.table(rows.map(({ id, name }) => ({ id, name })));
    return rows.map((r) => r.name).filter(Boolean);
  } catch (err) {
    console.error("smart-api error:", err);
    return null;
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
  /** API + manufacturer pairs added with the "Add" button */
  apiManufacturers: ApiManufacturer[];
  trademarkOwner: string[];
};

type ApiManufacturer = { api: string; manufacturer: string };

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
  apiManufacturers: [],
  trademarkOwner: [],
};

export type ComplianceNotice = {
  title: string;
  message: string;
  reference: string;
};

// Excipient flags; API flags come from the NAFDAC ceiling list
const WARNING_RULES: ({
  field: "genericName";
  value: string;
} & ComplianceNotice)[] = [
  {
    field: "genericName",
    value: "Glycerol",
    title: "DEG / EG contamination risk — Glycerol",
    message:
      "Glycerol is considered a high-risk excipient, as it is often contaminated with toxic substances such as DEG. Controls should be taken to ensure that glycerol is of the required purity, and not contaminated with a contaminant (such as DEG) that can cause death when ingested.",
    reference: "Excipient quality control · DEG/EG screening",
  },
];

function getWarnings(f: FormState): ComplianceNotice[] {
  const excipients = WARNING_RULES.filter((r) =>
    f[r.field].some((v) => v.trim().toLowerCase() === r.value.toLowerCase()),
  ).map(({ title, message, reference }) => ({ title, message, reference }));

  const ceiling = ceilingMatches(
    f.apiManufacturers.map((p) => p.api),
    f.route,
  ).map((c) => ({
    title: `Ceiling list flag — ${c.label}`,
    message: `${c.label} (${c.dosageForms.toLowerCase()}) is on the NAFDAC ceiling list. This list restricts the registration of imported finished products that are adequately manufactured locally, so a new import registration for this product may not be accepted. Confirm the current status with NAFDAC before preparing the dossier.`,
    reference: `NAFDAC ceiling list 2026 · item ${c.sn}`,
  }));

  return [...excipients, ...ceiling];
}

/** How long the submit loader shows before the popup appears */
const LOADER_MS = 1500;

export const PRODUCT_STORAGE_KEY = "importRegisterProduct";

type Popup =
  { type: "warning"; notices: ComplianceNotice[] } | { type: "success" };

/** Error key → id of the control to focus, in on-screen order */
const FIELD_ORDER: [keyof Errors, string][] = [
  ["productClass", "productClass"],
  ["category", "category"],
  ["brandName", "brandName"],
  ["genericName", "genericName"],
  ["apiManufacturers", "apis"],
  ["strengths", "strengths-0"],
  ["packSizes", "packSizes-0"],
  ["dosageForm", "dosageForm"],
  ["route", "route"],
];

const errorId = (id: string) => `${id}-error`;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.productClass) e.productClass = "Select a product class";
  if (!f.category) e.category = "Select a category";
  if (!f.brandName.trim()) e.brandName = "Enter the brand name";
  if (!f.genericName.length) e.genericName = "Select or enter the generic name";
  if (!f.strengths.some((s) => s.trim())) e.strengths = "Enter the strength";
  if (!f.dosageForm) e.dosageForm = "Select a dosage form";
  if (!f.route) e.route = "Select a route";
  if (!f.packSizes.some((s) => s.trim())) e.packSizes = "Enter the pack size";
  if (!f.apiManufacturers.length)
    e.apiManufacturers =
      f.apis.length && f.manufacturer.length
        ? "Click “Add pair” to add the selected API and manufacturer"
        : "Select an API and manufacturer, then click “Add pair”";
  return e;
}

export default function ProductForm({ country }: { country: string }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [popup, setPopup] = useState<Popup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [manufacturersByApi, setManufacturersByApi] = useState<
    Record<string, string[]>
  >({});
  const [loadingApis, setLoadingApis] = useState<string[]>([]);
  // APIs whose lookup failed; not cached, so selecting the API again retries
  const [failedApis, setFailedApis] = useState<string[]>([]);
  const manufacturerOptions = manufacturersFor(form.apis, manufacturersByApi);
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);
  // Bumped after "Add" so the two pickers reset their typed text
  const [pickKey, setPickKey] = useState(0);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const errs = validate(form);
    setErrors(errs);
    const firstInvalid = FIELD_ORDER.find(([key]) => errs[key]);
    if (firstInvalid) {
      // Focus reads the field's label, "invalid" and its linked error message
      document.getElementById(firstInvalid[1])?.focus();
      return;
    }

    // Show the loader first; the warning / success popup appears after it
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, LOADER_MS));
    setSubmitting(false);

    const warnings = getWarnings(form);
    if (warnings.length) {
      setPopup({ type: "warning", notices: warnings });
      return;
    }

    const payload = {
      country,
      ...form,
      genericName: form.genericName[0],
      apis: [...new Set(form.apiManufacturers.map((p) => p.api))],
      manufacturer: [
        ...new Set(form.apiManufacturers.map((p) => p.manufacturer)),
      ],
      trademarkOwner: form.trademarkOwner[0],
      strengths: form.strengths.map((s) => s.trim()).filter(Boolean),
      packSizes: form.packSizes.map((s) => s.trim()).filter(Boolean),
      submittedAt: new Date().toISOString(),
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
        setFailedApis((f) => f.filter((x) => x !== inn));
        const names = await fetchSmartApi(inn);
        if (names) setManufacturersByApi((m) => ({ ...m, [inn]: names }));
        else setFailedApis((f) => [...f, inn]);
        setLoadingApis((l) => l.filter((x) => x !== inn));
      });
  }

  function handleAddApiManufacturer() {
    const api = form.apis[0];
    const manufacturer = form.manufacturer[0];
    if (!api || !manufacturer) return;
    const exists = form.apiManufacturers.some(
      (p) => p.api === api && p.manufacturer === manufacturer,
    );
    if (!exists) {
      set("apiManufacturers", [
        ...form.apiManufacturers,
        { api, manufacturer },
      ]);
    }
    set("apis", []);
    set("manufacturer", []);
    setPickKey((k) => k + 1);
  }

  function removeApiManufacturer(index: number) {
    set(
      "apiManufacturers",
      form.apiManufacturers.filter((_, i) => i !== index),
    );
  }

  function handleReset() {
    setForm(EMPTY);
    setErrors({});
    setPopup(null);
    setFormKey((k) => k + 1);
  }

  return (
    <div className={styles.shell}>
      <AppBar
        country={country}
        back={{ href: "/register", label: "Back to overview" }}
      />
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>New registration</p>
            <h1 className={styles.title}>Import Register</h1>
            <p className={styles.subtitle}>
              Enter the product details for registration in{" "}
              {country || "the selected market"}. All fields marked{" "}
              <span className={styles.required}>*</span> are required.
            </p>
          </div>
          <ol className={styles.stepper} aria-label="Form sections">
            <li>Product identity</li>
            <li>APIs &amp; manufacturers</li>
            <li>Presentation</li>
          </ol>
        </header>

        <form
          key={formKey}
          className={styles.card}
          onSubmit={handleSubmit}
          noValidate
        >
          <Step
            n={1}
            title="Product identity"
            desc="Classification and naming as it will appear in the registration application."
          >
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
                required
                aria-invalid={!!errors.brandName}
                aria-describedby={
                  errors.brandName ? errorId("brandName") : undefined
                }
                onChange={(e) => set("brandName", e.target.value)}
              />
            </Field>

            <Field
              label="Excipients (INN)"
              htmlFor="genericName"
              error={errors.genericName}
            >
              <SearchSelect
                required
                id="genericName"
                options={MOLECULES}
                value={form.genericName}
                allowCustom
                placeholder="e.g. Glycerol"
                invalid={!!errors.genericName}
                describedBy={
                  errors.genericName ? errorId("genericName") : undefined
                }
                onChange={(v) => set("genericName", v)}
              />
            </Field>
          </Step>

          <Step
            n={2}
            title="APIs & manufacturers"
            desc="Pair each active ingredient with its manufacturing site, then click Add pair."
          >
            <Field label="API(s)" htmlFor="apis" error={errors.apis}>
              <SearchSelect
                required
                key={`apis-${pickKey}`}
                id="apis"
                options={MOLECULES_API}
                value={form.apis}
                placeholder="Search and select APIs"
                invalid={!!errors.apis || !!errors.apiManufacturers}
                describedBy={
                  errors.apiManufacturers ? "apiManufacturers-error" : undefined
                }
                onChange={handleApisChange}
              />
            </Field>

            <Field
              label="Manufacturer Name / Factory"
              htmlFor="manufacturer"
              error={errors.manufacturer}
            >
              <SearchSelect
                required
                key={`manufacturer-${pickKey}`}
                id="manufacturer"
                options={manufacturerOptions}
                value={form.manufacturer}
                placeholder={
                  !form.apis.length
                    ? "Select API(s) first"
                    : loadingApis.some((a) => form.apis.includes(a))
                      ? "Loading manufacturers…"
                      : failedApis.some((a) => form.apis.includes(a))
                        ? "Couldn’t load manufacturers — reselect the API to retry"
                        : manufacturerOptions.length
                          ? "Search company / factory"
                          : "No manufacturers found for this API"
                }
                invalid={!!errors.manufacturer}
                onChange={(v) => set("manufacturer", v)}
              />
            </Field>

            <div className={`${styles.wide} ${styles.pairArea}`}>
              {form.apis.length > 0 && form.manufacturer.length > 0 && (
                <button
                  type="button"
                  className={styles.pairAddBtn}
                  onClick={handleAddApiManufacturer}
                >
                  + Add pair
                </button>
              )}

              {form.apiManufacturers.length > 0 && (
                <table className={styles.pairTable}>
                  <thead>
                    <tr>
                      <th scope="col">API</th>
                      <th scope="col">Manufacturer</th>
                      <th scope="col">
                        <span className={styles.srOnly}>Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.apiManufacturers.map((p, i) => (
                      <tr key={`${p.api}|${p.manufacturer}`}>
                        <td>{p.api}</td>
                        <td>{p.manufacturer}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.pairRemove}
                            aria-label={`Remove ${p.api} – ${p.manufacturer}`}
                            onClick={() => removeApiManufacturer(i)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {errors.apiManufacturers && (
                <p id="apiManufacturers-error" className={styles.error}>
                  {errors.apiManufacturers}
                </p>
              )}
            </div>
          </Step>

          <Step
            n={3}
            title="Presentation"
            desc="Strengths, pack sizes, dosage form and route of administration."
          >
            <Field
              label="Strength"
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
              label="Pack Size"
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

            {/* <Field
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
          </Field> */}
          </Step>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              ref={submitRef}
              type="submit"
              className={styles.primary}
              disabled={submitting}
            >
              Save &amp; continue
            </button>
          </div>
        </form>
      </div>

      {submitting && (
        <LoadingScreen text="Please wait while we save your product details" />
      )}

      {popup && (
        <ResultPopup
          popup={popup}
          country={country}
          returnFocusTo={submitRef}
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
  returnFocusTo,
}: {
  popup: Popup;
  country: string;
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onNext: () => void;
}) {
  const isWarning = popup.type === "warning";

  return (
    <Modal
      labelledBy="popup-title"
      returnFocusTo={returnFocusTo}
      alert={isWarning}
      className={`${styles.popup} ${isWarning ? styles.popupWarning : styles.popupSuccess}`}
      onClose={onClose}
    >
      <span className={styles.popupIcon} aria-hidden>
        <Icon name={isWarning ? "alert" : "check"} />
      </span>
      <h2 id="popup-title" className={styles.popupTitle}>
        {isWarning ? "Compliance review required" : "Product details saved"}
      </h2>

      {isWarning ? (
        <>
          <p className={styles.popupText}>
            The following items were flagged against regulatory lists. Review
            them before continuing.
          </p>
          <ul className={styles.noticeList}>
            {popup.notices.map((n) => (
              <li key={n.title} className={styles.notice}>
                <span className={styles.noticeTitle}>{n.title}</span>
                <span className={styles.noticeBody}>{n.message}</span>
                <span className={styles.noticeRef}>
                  <Icon name="file" />
                  Ref: {n.reference}
                </span>
              </li>
            ))}
          </ul>
        </>
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
            data-autofocus
          >
            Review details
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
              data-autofocus
            >
              Next →
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

function Step({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={styles.step}>
      <legend className={styles.stepHead}>
        <span className={styles.stepNum}>{n}</span>
        <span>
          <span className={styles.stepTitle}>{title}</span>
          <span className={styles.stepDesc}>{desc}</span>
        </span>
      </legend>
      <div className={styles.grid}>{children}</div>
    </fieldset>
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
      {error && (
        <p id={errorId(htmlFor)} className={styles.error}>
          {error}
        </p>
      )}
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
        required
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId(id) : undefined}
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
            required={i === 0}
            aria-invalid={invalid}
            aria-describedby={
              invalid && i === 0 ? errorId(`${idPrefix}-0`) : undefined
            }
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
    </div>
  );
}
