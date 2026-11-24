// NAFDAC ceiling list (source: Updated-NAFDAC-Ceiling-List-2026.pdf).
// Imported finished products on this list are restricted because they are
// adequately manufactured locally.
//
// Ingredient keys are lowercase base names; a selected API matches a key when
// it equals it or starts with it plus a salt/qualifier ("Piperaquine
// phosphate" matches "piperaquine").
//
// Not modelled: item 10 "Alcohol based hand sanitizers" (a product type, not an
// API selectable in the form).

/** Which routes an entry applies to, from its "Dosage form" column */
export type CeilingScope =
  | "all" // ALL DOSAGE FORMS
  | "oral" // ORAL DOSAGE FORMS (*Excluding Parenteral)
  | "non-parenteral" // ALL DOSAGE FORMS (*Excluding Parenteral)
  | "non-inhaled" // ALL DOSAGE FORMS (Excluding Inhalers)
  | "topical"; // topical creams / emulsions / ointments

export type CeilingEntry = {
  sn: number;
  /** Active ingredient as printed (tidied) */
  label: string;
  /** Dosage form column as printed */
  dosageForms: string;
  scope: CeilingScope;
  /**
   * exact: the product's APIs are exactly this listed combination
   * fdc: any combination (2+ APIs) that contains this API
   * contains: any product that contains this API (single-API entries, so
   *   Albendazole + another API is still flagged)
   */
  match:
    | { kind: "exact"; apis: string[] }
    | { kind: "fdc"; api: string }
    | { kind: "contains"; api: string };
};

const ALL = "All dosage forms";
const ORAL = "Oral dosage forms (excluding parenteral)";

const single = (
  sn: number,
  label: string,
  api: string,
  scope: CeilingScope = "all",
  dosageForms = scope === "oral" ? ORAL : ALL,
): CeilingEntry => ({
  sn,
  label,
  dosageForms,
  scope,
  match: { kind: "contains", api },
});

const combo = (
  sn: number,
  label: string,
  apis: string[],
  scope: CeilingScope = "all",
): CeilingEntry => ({
  sn,
  label,
  dosageForms: scope === "oral" ? ORAL : ALL,
  scope,
  match: { kind: "exact", apis },
});

export const CEILING_LIST: CeilingEntry[] = [
  single(1, "Ampicillin", "ampicillin"),
  single(2, "Indomethacin", "indomethacin"),
  single(3, "Tetracycline", "tetracycline"),
  single(4, "Cyproheptadine", "cyproheptadine"),
  combo(5, "Sulphadoxine/Pyrimethamine", ["sulfadoxine", "pyrimethamine"]),
  single(6, "Piperaquine", "piperaquine"),
  single(7, "Mebendazole", "mebendazole"),
  combo(8, "Pseudoephedrine + Paracetamol + Caffeine", [
    "pseudoephedrine",
    "paracetamol",
    "caffeine",
  ]),
  single(9, "Ibuprofen", "ibuprofen"),
  single(11, "Albendazole", "albendazole"),
  {
    sn: 12,
    label: "Paracetamol-containing fixed dose combination",
    dosageForms: ALL,
    scope: "all",
    match: { kind: "fdc", api: "paracetamol" },
  },
  single(13, "Vitamin C (Ascorbic acid)", "ascorbic acid", "oral"),
  single(14, "Omeprazole", "omeprazole", "oral"),
  single(15, "Chlorpheniramine maleate", "chlorpheniramine"),
  single(16, "Prednisolone tablet", "prednisolone", "oral"),
  single(
    17,
    "Diazepam",
    "diazepam",
    "non-parenteral",
    "All dosage forms (excluding parenteral)",
  ),
  single(18, "Ciprofloxacin", "ciprofloxacin"),
  single(19, "Piroxicam", "piroxicam", "oral"),
  {
    sn: 20,
    label: "Ibuprofen-containing fixed dose combination",
    dosageForms: ALL,
    scope: "all",
    match: { kind: "fdc", api: "ibuprofen" },
  },
  single(21, "Amlodipine", "amlodipine"),
  single(22, "Cimetidine", "cimetidine"),
  single(23, "Hyoscine butylbromide", "hyoscine butylbromide", "oral"),
  combo(
    24,
    "Amoxicillin/Clavulanic acid",
    ["amoxicillin", "clavulanic acid"],
    "oral",
  ),
  single(
    25,
    "Amoxicillin",
    "amoxicillin",
    "all",
    "All dosage forms (including dispersible tablets)",
  ),
  single(26, "Erythromycin", "erythromycin"),
  combo(27, "Ampicillin/Cloxacillin", ["ampicillin", "cloxacillin"]),
  single(28, "Griseofulvin", "griseofulvin"),
  single(29, "Metformin", "metformin"),
  combo(30, "Salbutamol + Theophylline", ["salbutamol", "theophylline"]),
  single(
    31,
    "Salbutamol",
    "salbutamol",
    "non-inhaled",
    "All dosage forms (excluding inhalers)",
  ),
  single(32, "Bisacodyl", "bisacodyl"),
  {
    sn: 33,
    label: "Topical products containing salicylic acid",
    dosageForms: "Creams",
    scope: "topical",
    match: { kind: "contains", api: "salicylic acid" },
  },
  single(
    34,
    "Topical benzyl benzoate preparations",
    "benzyl benzoate",
    "topical",
    "Emulsions",
  ),
  single(35, "Topical sulphur", "sulphur", "topical", "Ointment"),
  single(36, "Topical penicillin", "penicillin", "topical", "Ointment"),
];

/** Names to offer in the API picker so every entry above can be selected */
export const CEILING_LIST_APIS = [
  "Albendazole",
  "Amlodipine",
  "Amoxicillin",
  "Ampicillin",
  "Ascorbic acid (Vitamin C)",
  "Benzyl benzoate",
  "Bisacodyl",
  "Caffeine",
  "Chlorpheniramine maleate",
  "Cimetidine",
  "Ciprofloxacin",
  "Clavulanic acid",
  "Cloxacillin",
  "Cyproheptadine",
  "Diazepam",
  "Erythromycin",
  "Griseofulvin",
  "Hyoscine butylbromide",
  "Ibuprofen",
  "Indomethacin",
  "Mebendazole",
  "Metformin",
  "Omeprazole",
  "Paracetamol",
  "Penicillin",
  "Piperaquine phosphate",
  "Piroxicam",
  "Prednisolone",
  "Pseudoephedrine",
  "Pyrimethamine",
  "Salbutamol",
  "Salicylic acid",
  "Sulfadoxine",
  "Sulphur",
  "Tetracycline",
  "Theophylline",
];

const PARENTERAL = ["IV", "IM", "SC"];

function inScope(scope: CeilingScope, route: string) {
  switch (scope) {
    case "all":
      return true;
    case "oral":
      return route === "Oral";
    case "non-parenteral":
      return !PARENTERAL.includes(route);
    case "non-inhaled":
      return route !== "Inhalation";
    case "topical":
      return route === "Topical";
  }
}

const normalize = (s: string) => s.trim().toLowerCase();
const isApi = (name: string, key: string) =>
  name === key || name.startsWith(`${key} `);

/** Ceiling-list entries that apply to a product's APIs and route */
export function ceilingMatches(apis: string[], route: string): CeilingEntry[] {
  const names = [...new Set(apis.map(normalize))];
  const has = (key: string) => names.some((n) => isApi(n, key));

  const matched = CEILING_LIST.filter((entry) => {
    if (!inScope(entry.scope, route)) return false;
    const m = entry.match;
    switch (m.kind) {
      case "exact":
        return (
          names.length === m.apis.length &&
          m.apis.every(has) &&
          names.every((n) => m.apis.some((k) => isApi(n, k)))
        );
      case "fdc":
        return names.length > 1 && has(m.api);
      case "contains":
        return has(m.api);
    }
  });

  // Drop a single-API flag already covered by a more specific matched entry
  // (Amoxicillin + Clavulanic acid → item 24 only, not also item 25)
  const covered = (api: string) =>
    matched.some(
      (e) =>
        (e.match.kind === "exact" && e.match.apis.includes(api)) ||
        (e.match.kind === "fdc" && e.match.api === api),
    );
  return matched.filter(
    (e) => e.match.kind !== "contains" || !covered(e.match.api),
  );
}
