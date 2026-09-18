import { StringKey } from "../i18n/strings";

export interface AllergenDef {
  key: string;
  icon: string;
  labelKey: StringKey;
  keywords: string[];
}

// The 8 categories from the teammate demo (claude.ai/artifact/PrTZ9BbUidr8NrPZhZQTem)
// and docs/PRODUCT.md "지금 증분". Backend returns free-text `allergens: string[]`
// (see docs/API_CONTRACT.md), not a fixed enum, so `keywords` maps that free text
// onto these categories for display — a frontend-only heuristic, not a contract.
// `labelKey` points into src/i18n/strings.ts so the grid follows the app's UI
// language rather than always showing English.
export const ALLERGEN_CATALOG: AllergenDef[] = [
  { key: "pork", icon: "🐷", labelKey: "allergen.pork", keywords: ["pork", "돼지"] },
  {
    key: "shellfish",
    icon: "🦐",
    labelKey: "allergen.shellfish",
    keywords: ["shrimp", "shellfish", "crab", "prawn", "새우", "갑각류"],
  },
  {
    key: "wheat",
    icon: "🌾",
    labelKey: "allergen.wheat",
    keywords: ["wheat", "gluten", "flour", "밀", "글루텐"],
  },
  {
    key: "dairy",
    icon: "🥛",
    labelKey: "allergen.dairy",
    keywords: ["milk", "dairy", "우유", "유제품"],
  },
  { key: "peanut", icon: "🥜", labelKey: "allergen.peanut", keywords: ["peanut", "땅콩"] },
  {
    key: "soy",
    icon: "🫘",
    labelKey: "allergen.soy",
    keywords: ["soy", "soybean", "대두", "간장"],
  },
  { key: "egg", icon: "🥚", labelKey: "allergen.egg", keywords: ["egg", "계란", "달걀"] },
  {
    key: "buckwheat",
    icon: "🌰",
    labelKey: "allergen.buckwheat",
    keywords: ["buckwheat", "메밀"],
  },
];

export function matchesAllergen(
  itemAllergens: string[],
  def: AllergenDef
): boolean {
  const lower = itemAllergens.map((a) => a.toLowerCase());
  return def.keywords.some((kw) =>
    lower.some((a) => a.includes(kw.toLowerCase()))
  );
}
