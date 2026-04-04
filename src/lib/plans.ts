export type PlanId = "free" | "standard" | "premium";

export interface PlanFeature {
  key: string;
  label: string;
  free: boolean | number | string;
  standard: boolean | number | string;
  premium: boolean | number | string;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // Kč/měsíc
  yearlyPrice: number; // Kč/rok
  description: string;
  badge?: string;
  highlighted?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Zdarma",
    price: 0,
    yearlyPrice: 0,
    description: "Základní online přítomnost vaší restaurace",
  },
  {
    id: "standard",
    name: "Standard",
    price: 299,
    yearlyPrice: 2990,
    description: "Profesionální vizitka s denním menu",
    badge: "Oblíbený",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 599,
    yearlyPrice: 5990,
    description: "Maximální viditelnost a všechny funkce",
  },
];

export const features: PlanFeature[] = [
  { key: "profile", label: "Základní profil (název, adresa, telefon)", free: true, standard: true, premium: true },
  { key: "menu", label: "Jídelní lístek", free: "5 položek", standard: "Neomezeno", premium: "Neomezeno" },
  { key: "hours", label: "Otevírací doba", free: true, standard: true, premium: true },
  { key: "vizitka", label: "Interaktivní vizitka", free: "Základní", standard: "Rozšířená", premium: "Plná" },
  { key: "daily_menu", label: "Denní menu", free: false, standard: true, premium: true },
  { key: "qr_download", label: "QR kód ke stažení", free: false, standard: true, premium: true },
  { key: "photos", label: "Fotogalerie", free: false, standard: "5 fotek", premium: "Neomezeno" },
  { key: "social", label: "Sociální sítě na vizitce", free: false, standard: true, premium: true },
  { key: "specialties", label: "Speciality a štítky", free: false, standard: true, premium: true },
  { key: "amenities", label: "Vybavení (WiFi, parkování...)", free: false, standard: true, premium: true },
  { key: "map", label: "Mapa na vizitce", free: false, standard: true, premium: true },
  { key: "theme", label: "Vlastní barva vizitky", free: false, standard: false, premium: true },
  { key: "featured", label: "Zvýrazněná pozice ve výsledcích", free: false, standard: false, premium: true },
  { key: "analytics", label: "Statistiky návštěvnosti", free: false, standard: false, premium: true },
  { key: "allergens", label: "Alergeny u jídel", free: false, standard: true, premium: true },
  { key: "description", label: "Rozšířený popis restaurace", free: false, standard: true, premium: true },
];

export function getPlan(planId: string): Plan {
  return plans.find((p) => p.id === planId) || plans[0];
}

export function hasFeature(planId: string, featureKey: string): boolean {
  const feature = features.find((f) => f.key === featureKey);
  if (!feature) return false;
  const value = feature[planId as PlanId];
  return value === true || (typeof value === "string" && value !== "");
}

export function getFeatureValue(planId: string, featureKey: string): boolean | number | string {
  const feature = features.find((f) => f.key === featureKey);
  if (!feature) return false;
  return feature[planId as PlanId];
}

export function getMenuLimit(planId: string): number {
  if (planId === "free") return 5;
  return Infinity;
}

export function getPhotoLimit(planId: string): number {
  if (planId === "free") return 0;
  if (planId === "standard") return 5;
  return Infinity;
}
