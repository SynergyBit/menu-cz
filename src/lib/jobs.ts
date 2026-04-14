export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Hlavní pracovní poměr" },
  { value: "part_time", label: "Částečný úvazek" },
  { value: "brigada", label: "Brigáda" },
  { value: "dohoda", label: "DPP / DPČ / Dohoda" },
] as const;

export const JOB_POSITIONS = [
  "Kuchař",
  "Pomocný kuchař",
  "Šéfkuchař",
  "Cukrář",
  "Pekař",
  "Servírka / Číšník",
  "Vrchní",
  "Barman / Baristka",
  "Pomocný personál",
  "Umývač nádobí",
  "Provozní",
  "Manažer",
  "Pizzaiolo",
  "Sushi kuchař",
  "Recepční",
  "Jiná pozice",
] as const;

export const COUNTRIES = [
  { value: "CZ", label: "Česko", flag: "🇨🇿", currency: "CZK" },
  { value: "SK", label: "Slovensko", flag: "🇸🇰", currency: "EUR" },
] as const;

export function getEmploymentLabel(type: string): string {
  return EMPLOYMENT_TYPES.find((t) => t.value === type)?.label || type;
}

export function formatSalary(
  from: number | null,
  to: number | null,
  currency: string,
  period: string,
): string | null {
  if (!from && !to) return null;
  const suffix = period === "hour" ? "/hod" : "/měsíc";
  const cur = currency === "EUR" ? "€" : "Kč";
  if (from && to) return `${from.toLocaleString("cs")} – ${to.toLocaleString("cs")} ${cur}${suffix}`;
  if (from) return `od ${from.toLocaleString("cs")} ${cur}${suffix}`;
  if (to) return `do ${to.toLocaleString("cs")} ${cur}${suffix}`;
  return null;
}
