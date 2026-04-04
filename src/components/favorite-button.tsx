"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  restaurantId: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ restaurantId, size = "md" }: FavoriteButtonProps) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFav(isFavorite(restaurantId));
  }, [restaurantId]);

  if (!mounted) return null;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(restaurantId);
    setFav(newState);
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
