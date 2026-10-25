"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash, ArrowUp, ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

type Locale = "es" | "en" | "fr";
type NewsStatus = "draft" | "published" | "archived";

interface Translation {
    id: string;
    locale: Locale;
    title: string;
    summary: string | null;
    content: string;
}

interface NewsImage {
    id: string;
    image_url: string;
    alt: string | null;
    sort_order: number;
}

interface NewsRecord {
    id: string;
    status: NewsStatus;
    published_at: string | null;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    created_at: string;
    updated_at: string;
    news_translations: Translation[] | Translation | null;
    news_images: NewsImage[] | null;
}

interface TranslationForm {
    title: string;
    summary: string;
    content: string;
}

interface ImageForm {
    id: string | null;
    image_url: string;
    alt: string;
}

interface NewsForm {
    status: NewsStatus;
    cover_image_url: string;
    cover_image_alt: string;
    translations: Record<Locale, TranslationForm>;
    images: ImageForm[];
}

const locales: { id: Locale; labelKey: "editor_news_locale_es" | "editor_news_locale_en" | "editor_news_locale_fr" }[] = [
    { id: "es", labelKey: "editor_news_locale_es" },
    { id: "en", labelKey: "editor_news_locale_en" },
    { id: "fr", labelKey: "editor_news_locale_fr" },
];

const emptyForm: NewsForm = {
    status: "draft",
    cover_image_url: "",
    cover_image_alt: "",
    translations: {
        es: { title: "", summary: "", content: "" },
        en: { title: "", summary: "", content: "" },
        fr: { title: "", summary: "", content: "" },
    },
    images: [],
};

function normalizeRelations<T>(value: T[] | T | null | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function getNewsTitle(item: NewsRecord, locale: Locale) {
    const translations = normalizeRelations(item.news_translations);
    return translations.find((translation) => translation.locale === locale)?.title
        ?? translations.find((translation) => translation.locale === "es")?.title
        ?? translations.find((translation) => translation.title)?.title
        ?? "—";
}

function createForm(item?: NewsRecord): NewsForm {
    if (!item) {
        return {
            ...emptyForm,
            translations: {
                es: { ...emptyForm.translations.es },
                en: { ...emptyForm.translations.en },
                fr: { ...emptyForm.translations.fr },
            },
            images: [],
        };
    }

    const translations = normalizeRelations(item.news_translations);
    const byLocale = (locale: Locale): TranslationForm => {
        const translation = translations.find((entry) => entry.locale === locale);
        return {
            title: translation?.title ?? "",
            summary: translation?.summary ?? "",
            content: translation?.content ?? "",
        };
    };

    return {
        status: item.status,
        cover_image_url: item.cover_image_url ?? "",
        cover_image_alt: item.cover_image_alt ?? "",
        translations: {
            es: byLocale("es"),
            en: byLocale("en"),
            fr: byLocale("fr"),
        },
        images: (item.news_images ?? [])
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((image) => ({
                id: image.id,
                image_url: image.image_url,
                alt: image.alt ?? "",
            })),
    };
}

export default function NewsManager() {
    const { language, t } = useLanguage();
    const [news, setNews] = useState<NewsRecord[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<NewsForm>(() => createForm());
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function loadNews() {
        setLoading(true);
        setError(null);

        const { data, error: loadError } = await supabase
            .from("news")
            .select(`
                id,
                status,
                published_at,
                cover_image_url,
                cover_image_alt,
                created_at,
                updated_at,
                news_translations (
                    id,
                    locale,
                    title,
                    summary,
                    content
                ),
                news_images (
                    id,
                    image_url,
                    alt,
                    sort_order
                )
            `)
            .order("created_at", { ascending: false });

        if (loadError) {
            console.error("Error cargando noticias para el editor:", loadError);
            setNews([]);
            setError(`${t.editor_news_load_error}: ${loadError.message}`);
            setLoading(false);
            return;
        }

        setNews((data ?? []) as unknown as NewsRecord[]);
        setLoading(false);
    }

    useEffect(() => {
        void loadNews();
    }, []);

    const filteredNews = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase();
        if (!normalizedSearch) return news;

        return news.filter((item) =>
            normalizeRelations(item.news_translations).some((translation) =>
                `${translation.title} ${translation.summary ?? ""}`
                    .toLocaleLowerCase()
                    .includes(normalizedSearch)
            )
        );
    }, [news, search]);

    function updateTranslation(
        locale: Locale,
        field: keyof TranslationForm,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            translations: {
                ...current.translations,
                [locale]: {
                    ...current.translations[locale],
                    [field]: value,
                },
            },
        }));
        setMessage(null);
        setError(null);
    }

    function openCreateForm() {
        setEditingId(null);
        setForm(createForm());
        setShowForm(true);
        setMessage(null);
        setError(null);
    }

    function openEditForm(item: NewsRecord) {
        setEditingId(item.id);
        setForm(createForm(item));
        setShowForm(true);
        setMessage(null);
        setError(null);
    }

    function closeForm() {
        setEditingId(null);
        setForm(createForm());
        setShowForm(false);
        setError(null);
    }

    function updateImage(index: number, field: "image_url" | "alt", value: string) {
        setForm((current) => ({
            ...current,
            images: current.images.map((image, imageIndex) =>
                imageIndex === index ? { ...image, [field]: value } : image
            ),
        }));
        setError(null);
    }

    function moveImage(index: number, direction: -1 | 1) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= form.images.length) return;

        setForm((current) => {
            const images = current.images.slice();
            [images[index], images[targetIndex]] = [images[targetIndex], images[index]];
            return { ...current, images };
        });
    }

    function validateForm() {
        const translationsWithContent = locales.filter(({ id }) => {
            const translation = form.translations[id];
            return translation.title.trim() || translation.summary.trim() || translation.content.trim();
        });

        for (const { id } of translationsWithContent) {
            const translation = form.translations[id];
            if (!translation.title.trim() || !translation.content.trim()) {
                setError(t.editor_news_translation_incomplete);
                return false;
            }
        }

        if (translationsWithContent.length === 0) {
            setError(t.editor_news_translation_required);
            return false;
        }

        if (form.status === "published") {
            const spanish = form.translations.es;
            if (!spanish.title.trim() || !spanish.content.trim()) {
                setError(t.editor_news_spanish_required);
                return false;
            }
        }

        const invalidImage = form.images.some((image) => !image.image_url.trim());
        if (invalidImage) {
            setError(t.editor_news_image_url_required);
            return false;
        }

        return true;
    }

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (!validateForm()) return;

        setSaving(true);
        const existing = news.find((item) => item.id === editingId);
        const now = new Date().toISOString();
        const publishedAt = form.status === "published"
            ? existing?.published_at ?? now
            : form.status === "archived"
                ? existing?.published_at ?? null
                : null;

        const newsPayload = {
            status: form.status,
            published_at: publishedAt,
            cover_image_url: form.cover_image_url.trim() || null,
            cover_image_alt: form.cover_image_alt.trim() || null,
            updated_at: now,
        };

        let newsId = editingId;
        let saveError: string | null = null;

        if (newsId) {
            const { error: updateError } = await supabase
                .from("news")
                .update(newsPayload)
                .eq("id", newsId);
            if (updateError) saveError = updateError.message;
        } else {
            const { data, error: insertError } = await supabase
                .from("news")
                .insert({
                    ...newsPayload,
                    id: crypto.randomUUID(),
                    created_at: now,
                })
                .select("id")
                .single();
            if (insertError) saveError = insertError.message;
            else newsId = data.id;
        }

        if (saveError || !newsId) {
            setError(`${t.editor_news_save_error}: ${saveError ?? ""}`);
            setSaving(false);
            return;
        }

        const translationRows = locales
            .map(({ id: locale }) => {
                const translation = form.translations[locale];
                if (!translation.title.trim() && !translation.content.trim() && !translation.summary.trim()) {
                    return null;
                }
                return {
                    news_id: newsId,
                    locale,
                    title: translation.title.trim(),
                    summary: translation.summary.trim() || null,
                    content: translation.content.trim(),
                };
            })
            .filter((row): row is NonNullable<typeof row> => row !== null);

        const filledLocales = new Set(translationRows.map((row) => row.locale));
        const emptyLocales = locales.map(({ id }) => id).filter((locale) => !filledLocales.has(locale));

        if (translationRows.length > 0) {
            const { error: translationsError } = await supabase
                .from("news_translations")
                .upsert(translationRows, { onConflict: "news_id,locale" });
            if (translationsError) saveError = translationsError.message;
        }

        if (!saveError && emptyLocales.length > 0 && editingId) {
            const { error: clearTranslationsError } = await supabase
                .from("news_translations")
                .delete()
                .eq("news_id", newsId)
                .in("locale", emptyLocales);
            if (clearTranslationsError) saveError = clearTranslationsError.message;
        }

        if (!saveError) {
            const existingImageIds = (existing?.news_images ?? []).map((image) => image.id);
            const imageRows = form.images.map((image, sort_order) => ({
                id: image.id ?? crypto.randomUUID(),
                news_id: newsId,
                image_url: image.image_url.trim(),
                alt: image.alt.trim() || null,
                sort_order,
            }));
            const retainedIds = new Set(imageRows.map((image) => image.id));
            const removedIds = existingImageIds.filter((id) => !retainedIds.has(id));

            if (imageRows.length > 0) {
                const { error: imagesError } = await supabase
                    .from("news_images")
                    .upsert(imageRows, { onConflict: "id" });
                if (imagesError) saveError = imagesError.message;
            }

            if (!saveError && removedIds.length > 0) {
                const { error: removeImagesError } = await supabase
                    .from("news_images")
                    .delete()
                    .eq("news_id", newsId)
                    .in("id", removedIds);
                if (removeImagesError) saveError = removeImagesError.message;
            }
        }

        setSaving(false);

        if (saveError) {
            setError(`${t.editor_news_save_error}: ${saveError}`);
            await loadNews();
            return;
        }

        setMessage(editingId ? t.editor_news_updated : t.editor_news_created);
        setShowForm(false);
        setEditingId(null);
        setForm(createForm());
        await loadNews();
    }

    async function handleDelete(item: NewsRecord) {
        const title = getNewsTitle(item, language);
        if (!window.confirm(`${t.editor_news_delete_confirm}\n\n${title}`)) return;

        setError(null);
        setMessage(null);

        const { error: deleteError } = await supabase
            .from("news")
            .delete()
            .eq("id", item.id);

        if (deleteError) {
            setError(`${t.editor_news_delete_error}: ${deleteError.message}`);
            return;
        }

        if (editingId === item.id) closeForm();
        setMessage(t.editor_news_deleted);
        await loadNews();
    }

    const localeLabel = {
        es: t.editor_news_locale_es,
        en: t.editor_news_locale_en,
        fr: t.editor_news_locale_fr,
    } satisfies Record<Locale, string>;

    const statusLabel: Record<NewsStatus, string> = {
        draft: t.editor_news_status_draft,
        published: t.editor_news_status_published,
        archived: t.editor_news_status_archived,
    };

    const dateLocale = language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-GB";

    return (
        <section className="news-manager" aria-labelledby="news-manager-title">
            <div className="news-manager-header">
                <div>
                    <h2 id="news-manager-title">{t.editor_news_manager_title}</h2>
                    <p>{t.editor_news_manager_description}</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={openCreateForm}>
                    <Plus size={18} weight="bold" />
                    {t.editor_news_create}
                </button>
            </div>

            {message && <p className="project-manager-message success" role="status">{message}</p>}
            {error && <p className="project-manager-message error" role="alert">{error}</p>}

            <div className="news-manager-search">
                <input
                    type="search"
                    value={search}
                    placeholder={t.editor_news_search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {showForm && (
                <form className="news-manager-form" onSubmit={handleSave}>
                    <div className="news-manager-form-header">
                        <h3>{editingId ? t.editor_news_edit : t.editor_news_new}</h3>
                        <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}>
                            {t.editor_projects_cancel}
                        </button>
                    </div>

                    <div className="news-manager-field news-manager-status-field">
                        <label htmlFor="news-status">{t.editor_news_status}</label>
                        <select
                            id="news-status"
                            value={form.status}
                            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as NewsStatus }))}
                        >
                            <option value="draft">{statusLabel.draft}</option>
                            <option value="published">{statusLabel.published}</option>
                            <option value="archived">{statusLabel.archived}</option>
                        </select>
                    </div>

                    <fieldset className="news-manager-translations">
                        <legend>{t.editor_news_translations}</legend>
                        {locales.map(({ id: locale }) => (
                            <section className="news-manager-locale" key={locale}>
                                <h4>{localeLabel[locale]}</h4>
                                <div className="news-manager-field">
                                    <label htmlFor={`news-title-${locale}`}>{t.editor_news_title}</label>
                                    <input
                                        id={`news-title-${locale}`}
                                        value={form.translations[locale].title}
                                        onChange={(event) => updateTranslation(locale, "title", event.target.value)}
                                    />
                                </div>
                                <div className="news-manager-field">
                                    <label htmlFor={`news-summary-${locale}`}>{t.editor_news_summary}</label>
                                    <textarea
                                        id={`news-summary-${locale}`}
                                        rows={2}
                                        value={form.translations[locale].summary}
                                        onChange={(event) => updateTranslation(locale, "summary", event.target.value)}
                                    />
                                </div>
                                <div className="news-manager-field">
                                    <label htmlFor={`news-content-${locale}`}>{t.editor_news_content}</label>
                                    <textarea
                                        id={`news-content-${locale}`}
                                        rows={5}
                                        value={form.translations[locale].content}
                                        onChange={(event) => updateTranslation(locale, "content", event.target.value)}
                                    />
                                </div>
                            </section>
                        ))}
                    </fieldset>

                    <fieldset className="news-manager-media">
                        <legend>{t.editor_news_cover}</legend>
                        <div className="news-manager-field">
                            <label htmlFor="news-cover-url">{t.editor_news_cover_url}</label>
                            <input
                                id="news-cover-url"
                                type="url"
                                value={form.cover_image_url}
                                onChange={(event) => setForm((current) => ({ ...current, cover_image_url: event.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="news-manager-field">
                            <label htmlFor="news-cover-alt">{t.editor_news_cover_alt}</label>
                            <input
                                id="news-cover-alt"
                                value={form.cover_image_alt}
                                onChange={(event) => setForm((current) => ({ ...current, cover_image_alt: event.target.value }))}
                            />
                        </div>
                    </fieldset>

                    <fieldset className="news-manager-media">
                        <legend>{t.editor_news_gallery}</legend>
                        {form.images.map((image, index) => (
                            <div className="news-manager-gallery-row" key={image.id ?? `new-${index}`}>
                                <div className="news-manager-field">
                                    <label htmlFor={`news-image-url-${index}`}>{t.editor_news_image_url}</label>
                                    <input
                                        id={`news-image-url-${index}`}
                                        type="url"
                                        value={image.image_url}
                                        onChange={(event) => updateImage(index, "image_url", event.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="news-manager-field">
                                    <label htmlFor={`news-image-alt-${index}`}>{t.editor_news_image_alt}</label>
                                    <input
                                        id={`news-image-alt-${index}`}
                                        value={image.alt}
                                        onChange={(event) => updateImage(index, "alt", event.target.value)}
                                    />
                                </div>
                                <div className="news-manager-gallery-actions">
                                    <button type="button" className="btn btn-outline" aria-label={t.editor_news_move_up} disabled={index === 0} onClick={() => moveImage(index, -1)}>
                                        <ArrowUp size={18} />
                                    </button>
                                    <button type="button" className="btn btn-outline" aria-label={t.editor_news_move_down} disabled={index === form.images.length - 1} onClick={() => moveImage(index, 1)}>
                                        <ArrowDown size={18} />
                                    </button>
                                    <button type="button" className="btn news-manager-remove-image" aria-label={t.editor_news_remove_image} onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))}>
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-outline" onClick={() => setForm((current) => ({ ...current, images: [...current.images, { id: null, image_url: "", alt: "" }] }))}>
                            <Plus size={18} />
                            {t.editor_news_add_image}
                        </button>
                    </fieldset>

                    <div className="account-actions">
                        <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}>
                            {t.editor_projects_cancel}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? t.editor_projects_loading : t.editor_news_save}
                        </button>
                    </div>
                </form>
            )}

            <div className="news-manager-list" aria-live="polite">
                {loading ? (
                    <p>{t.editor_news_loading}</p>
                ) : filteredNews.length === 0 ? (
                    <p className="project-manager-empty">{t.editor_news_no_results}</p>
                ) : (
                    filteredNews.map((item) => (
                        <article className="news-manager-item" key={item.id}>
                            {item.cover_image_url && (
                                <img src={item.cover_image_url} alt={item.cover_image_alt ?? ""} />
                            )}
                            <div className="news-manager-item-info">
                                <h3>{getNewsTitle(item, language)}</h3>
                                <p>{item.published_at ? new Date(item.published_at).toLocaleDateString(dateLocale) : t.editor_news_not_published}</p>
                                <span className={`news-manager-status status-${item.status}`}>
                                    {statusLabel[item.status] ?? item.status}
                                </span>
                            </div>
                            <div className="news-manager-item-actions">
                                <button type="button" className="btn btn-outline" onClick={() => openEditForm(item)}>
                                    {t.editor_projects_edit}
                                </button>
                                <button type="button" className="btn news-manager-remove-image" onClick={() => void handleDelete(item)} aria-label={`${t.editor_projects_delete}: ${getNewsTitle(item, language)}`}>
                                    <Trash size={18} />
                                    {t.editor_projects_delete}
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
