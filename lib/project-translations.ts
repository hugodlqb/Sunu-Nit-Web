export type ContentLocale = "es" | "en" | "fr";
export interface ProjectTranslation {
  id?: string; project_id?: string; locale: ContentLocale; name: string;
  description: string | null; detail_description: string | null;
}
export interface ProjectUpdateTranslation {
  id?: string; update_id?: string; locale: ContentLocale; title: string; description: string | null;
}
export function normalizeContentTranslations<T extends { locale: ContentLocale }>(value: T[] | T | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
/** selected locale -> Spanish -> any stored locale -> legacy field */
export function resolveLocalizedText<T extends { locale: ContentLocale }>(
  value: T[] | T | null | undefined, locale: ContentLocale, field: keyof T, legacyValue?: string | null
): string | null {
  const translations = normalizeContentTranslations(value);
  const read = (translation?: T): string | null => {
    const text = translation?.[field];
    return typeof text === "string" && text.trim().length > 0 ? text : null;
  };
  return read(translations.find(t => t.locale === locale)) ??
    read(translations.find(t => t.locale === "es")) ??
    translations.map(read).find((text): text is string => text !== null) ??
    (typeof legacyValue === "string" && legacyValue.trim() ? legacyValue : null);
}
