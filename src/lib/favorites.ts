const STORAGE_KEY = "gastroo_favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isFavorite(restaurantId: string): boolean {
  return getFavorites().includes(restaurantId);
}

export function toggleFavorite(restaurantId: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(restaurantId);
  if (idx >= 0) {
    favs.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return false;
  } else {
    favs.push(restaurantId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return true;
  }
}
