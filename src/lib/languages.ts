export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: "cs", name: "Čeština", flag: "🇨🇿", nativeName: "Čeština" },
  { code: "en", name: "Angličtina", flag: "🇬🇧", nativeName: "English" },
  { code: "de", name: "Němčina", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "fr", name: "Francouzština", flag: "🇫🇷", nativeName: "Français" },
  { code: "es", name: "Španělština", flag: "🇪🇸", nativeName: "Español" },
  { code: "it", name: "Italština", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "pl", name: "Polština", flag: "🇵🇱", nativeName: "Polski" },
  { code: "sk", name: "Slovenština", flag: "🇸🇰", nativeName: "Slovenčina" },
  { code: "uk", name: "Ukrajinština", flag: "🇺🇦", nativeName: "Українська" },
  { code: "ru", name: "Ruština", flag: "🇷🇺", nativeName: "Русский" },
  { code: "pt", name: "Portugalština", flag: "🇵🇹", nativeName: "Português" },
  { code: "nl", name: "Holandština", flag: "🇳🇱", nativeName: "Nederlands" },
  { code: "zh", name: "Čínština", flag: "🇨🇳", nativeName: "中文" },
  { code: "ja", name: "Japonština", flag: "🇯🇵", nativeName: "日本語" },
  { code: "ko", name: "Korejština", flag: "🇰🇷", nativeName: "한국어" },
  { code: "ar", name: "Arabština", flag: "🇸🇦", nativeName: "العربية" },
  { code: "vi", name: "Vietnamština", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thajština", flag: "🇹🇭", nativeName: "ไทย" },
  { code: "tr", name: "Turečtina", flag: "🇹🇷", nativeName: "Türkçe" },
  { code: "hu", name: "Maďarština", flag: "🇭🇺", nativeName: "Magyar" },
];

export function getLanguage(code: string): Language | undefined {
  return languages.find((l) => l.code === code);
}
