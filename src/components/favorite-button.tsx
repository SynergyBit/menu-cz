"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { isFavorite as isLocalFavorite, toggleFavorite as toggleLocalFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  restaurantId: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ restaurantId, size = "md" }: FavoriteButtonProps) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if logged in and load server favorites
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.favoriteIds) {
          setIsLoggedIn(true);
          setFav(data.favoriteIds.includes(restaurantId));
        } else {
          // Fallback to localStorage
          setFav(isLocalFavorite(restaurantId));
        }
      })
      .catch(() => {
        setFav(isLocalFavorite(restaurantId));
      });
  }, [restaurantId]);

  if (!mounted) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggedIn) {
      // Server-side toggle
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, action: "toggle" }),
      });
      const data = await res.json();
      setFav(data.isFavorite);
    } else {
      // localStorage fallback
      const newState = toggleLocalFavorite(restaurantId);
      setFav(newState);
    }
  }

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <button
      onClick={handleClick}
      className={`${btnSize} flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm transition-all hover:scale-110 ${
        fav ? "text-red-500" : "text-muted-foreground hover:text-red-400"
      }`}
    >
      <Heart className={`${iconSize} ${fav ? "fill-current" : ""}`} />
    </button>
  );
}
