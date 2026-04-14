const STORAGE_KEY = "gastroo_recent";
const MAX_ITEMS = 10;

export interface RecentRestaurant {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  cuisineType: string | null;
  logoUrl: string | null;
  visitedAt: number; // timestamp
}

export function getRecentRestaurants(): RecentRestaurant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentRestaurant(restaurant: Omit<RecentRestaurant, "visitedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentRestaurants();
    // Remove if already exists
    const filtered = current.filter((r) => r.id !== restaurant.id);
    // Add to beginning
    const updated = [{ ...restaurant, visitedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable
  }
}
