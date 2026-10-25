export type ContentLocale = "es" | "en" | "fr";
export interface ProjectTranslation { id?: string; project_id?: string; locale: ContentLocale; name: string; description: string | null; detail_description: string | null; }
export interface ProjectUpdateTranslation { id?: string; update_id?: string; locale: ContentLocale; title: string; description: string | null; }
export function normalizeContentTranslations<T extends { locale: ContentLocale }>(value: T[] | T | null | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}
/** Fallback order: selected language, Spanish, any available translation, legacy field. */
export function resolveLocalizedText<T extends { locale: ContentLocale }>(value: T[] | T | null | undefined, locale: ContentLocale, field: keyof T, legacyValue?: string | null): string | null {
    const rows = normalizeContentTranslations(value);
    const read = (row?: T): string | null => { const text = row?.[field]; return typeof text === "string" && text.trim() ? text : null; };
    return read(rows.find(row => row.locale === locale)) ?? read(rows.find(row => row.locale === "es"))
        ?? rows.map(read).find((text): text is string => text !== null)
        ?? (typeof legacyValue === "string" && legacyValue.trim() ? legacyValue : null);
}
