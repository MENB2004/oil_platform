// src/lib/i18n.ts
export const SUPPORTED_LOCALES = ["en", "hi", "ta", "bn"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export function getBrowserLocale(): Locale {
  const nav = typeof navigator !== "undefined" ? navigator.language : "en";
  const lang = nav.split("-")[0];
  if (SUPPORTED_LOCALES.includes(lang as Locale)) return lang as Locale;
  return "en";
}
