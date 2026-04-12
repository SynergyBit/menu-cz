export interface Allergen {
  id: number;
  name: string;
  description: string;
  emoji: string;
}

export const allergens: Allergen[] = [
  { id: 1, name: "Lepek", description: "Obiloviny obsahující lepek (pšenice, žito, ječmen, oves)", emoji: "🌾" },
  { id: 2, name: "Korýši", description: "Korýši a výrobky z nich", emoji: "🦐" },
  { id: 3, name: "Vejce", description: "Vejce a výrobky z nich", emoji: "🥚" },
  { id: 4, name: "Ryby", description: "Ryby a výrobky z nich", emoji: "🐟" },
  { id: 5, name: "Arašídy", description: "Podzemnice olejná (arašídy)", emoji: "🥜" },
  { id: 6, name: "Sója", description: "Sójové boby a výrobky z nich", emoji: "🫘" },
  { id: 7, name: "Mléko", description: "Mléko a výrobky z něj (včetně laktózy)", emoji: "🥛" },
  { id: 8, name: "Skořápkové plody", description: "Mandle, lískové ořechy, vlašské ořechy, kešu aj.", emoji: "🌰" },
  { id: 9, name: "Celer", description: "Celer a výrobky z něj", emoji: "🥬" },
  { id: 10, name: "Hořčice", description: "Hořčice a výrobky z ní", emoji: "🟡" },
  { id: 11, name: "Sezam", description: "Sezamová semena a výrobky z nich", emoji: "⚪" },
  { id: 12, name: "Oxid siřičitý", description: "Oxid siřičitý a siřičitany (víno, sušené ovoce)", emoji: "🍷" },
  { id: 13, name: "Vlčí bob", description: "Vlčí bob (lupina) a výrobky z něj", emoji: "🌿" },
  { id: 14, name: "Měkkýši", description: "Měkkýši a výrobky z nich", emoji: "🐚" },
];

export function getAllergenById(id: number): Allergen | undefined {
  return allergens.find((a) => a.id === id);
}

export function parseAllergens(allergenStr: string | null): number[] {
  if (!allergenStr) return [];
  return allergenStr
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 14);
}

// Dietary filter: which allergens to exclude
export const dietaryFilters: Record<string, { label: string; emoji: string; excludeAllergens: number[] }> = {
  "gluten-free": { label: "Bezlepkové", emoji: "🌾", excludeAllergens: [1] },
  "dairy-free": { label: "Bez mléka", emoji: "🥛", excludeAllergens: [7] },
  "egg-free": { label: "Bez vajec", emoji: "🥚", excludeAllergens: [3] },
  "nut-free": { label: "Bez ořechů", emoji: "🌰", excludeAllergens: [5, 8] },
  "fish-free": { label: "Bez ryb", emoji: "🐟", excludeAllergens: [4] },
};
