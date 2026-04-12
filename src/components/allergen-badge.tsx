"use client";

import { parseAllergens, getAllergenById, dietaryFilters } from "@/lib/allergens";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AllergenBadgesProps {
  allergenStr: string | null;
}

export function AllergenBadges({ allergenStr }: AllergenBadgesProps) {
  const ids = parseAllergens(allergenStr);
  if (ids.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {ids.map((id) => {
        const allergen = getAllergenById(id);
        if (!allergen) return null;
        return (
          <Tooltip key={id}>
            <TooltipTrigger render={
              <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground cursor-help transition-colors hover:bg-muted/80" />
            }>
              <span>{allergen.emoji}</span>
              <span>{id}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-semibold">{allergen.emoji} {allergen.name} ({id})</p>
              <p className="text-xs text-muted-foreground">{allergen.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

interface DietaryFilterChipsProps {
  activeFilters: string[];
  onToggle: (key: string) => void;
}

export function DietaryFilterChips({ activeFilters, onToggle }: DietaryFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(dietaryFilters).map(([key, filter]) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
            activeFilters.includes(key)
              ? "bg-green-600 text-white shadow-sm"
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          <span>{filter.emoji}</span>
          {filter.label}
        </button>
      ))}
    </div>
  );
}
