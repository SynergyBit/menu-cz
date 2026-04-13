export const recipeCategories = [
  { value: "predkrmy", label: "Předkrmy", emoji: "🥗" },
  { value: "polevky", label: "Polévky", emoji: "🍲" },
  { value: "hlavni-jidla", label: "Hlavní jídla", emoji: "🍽️" },
  { value: "prilohy", label: "Přílohy", emoji: "🥔" },
  { value: "dezerty", label: "Dezerty", emoji: "🍰" },
  { value: "napoje", label: "Nápoje", emoji: "🥤" },
  { value: "peceni", label: "Pečení", emoji: "🍞" },
  { value: "saláty", label: "Saláty", emoji: "🥬" },
  { value: "omacky", label: "Omáčky", emoji: "🫙" },
  { value: "snidane", label: "Snídaně", emoji: "🥐" },
];

export const difficulties = [
  { value: "snadne", label: "Snadné", emoji: "🟢", color: "text-green-600 bg-green-500/10" },
  { value: "stredni", label: "Střední", emoji: "🟡", color: "text-yellow-600 bg-yellow-500/10" },
  { value: "narocne", label: "Náročné", emoji: "🔴", color: "text-red-600 bg-red-500/10" },
];

export function getCategory(value: string) {
  return recipeCategories.find((c) => c.value === value) || recipeCategories[2];
}

export function getDifficulty(value: string) {
  return difficulties.find((d) => d.value === value) || difficulties[1];
}
