export const eventTypes = [
  { value: "live_music", label: "Živá hudba", emoji: "🎵" },
  { value: "tasting", label: "Degustace", emoji: "🍷" },
  { value: "theme_night", label: "Tematický večer", emoji: "🎭" },
  { value: "special_menu", label: "Speciální menu", emoji: "👨‍🍳" },
  { value: "happy_hour", label: "Happy hour", emoji: "🍻" },
  { value: "brunch", label: "Brunch", emoji: "🥐" },
  { value: "workshop", label: "Workshop", emoji: "📚" },
  { value: "other", label: "Jiné", emoji: "✨" },
];

export function getEventType(value: string) {
  return eventTypes.find((t) => t.value === value) || eventTypes[eventTypes.length - 1];
}
