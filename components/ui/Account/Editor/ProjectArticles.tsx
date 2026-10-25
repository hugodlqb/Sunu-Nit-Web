"use client";

import {
    useEffect,
    useState
} from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { ContentLocale, ProjectUpdateTranslation, normalizeContentTranslations, resolveLocalizedText } from "@/lib/project-translations";

type Locale = ContentLocale;
const locales: Locale[] = ["es", "en", "fr"];
interface ProjectArticle {
    id: string; project_id: string; title: string; description: string | null; update_date: string; created_at: string;
    project_update_translations: ProjectUpdateTranslation[] | ProjectUpdateTranslation | null;
}

interface ProjectArticleImage {
    id: string;
    update_id: string;
    image_url: string;
    sort_order: number;
}

interface ArticleTranslationForm { title: string; description: string; }
interface ArticleForm { translations: Record<Locale, ArticleTranslationForm>; date: string; imageUrls: string[]; }

interface Props {
    projectId: string;
}

const emptyTranslation: ArticleTranslationForm = { title: "", description: "" };
const emptyForm: ArticleForm = {
    translations: { es: {...emptyTranslation}, en: {...emptyTranslation}, fr: {...emptyTranslation} },
    date: "", imageUrls: [""],
};
function createArticleForm(article?: ProjectArticle): ArticleForm {
    const rows = normalizeContentTranslations(article?.project_update_translations);
    const getLocale = (locale: Locale): ArticleTranslationForm => {
        const row = rows.find(item => item.locale === locale);
        const es = locale === "es";
        return { title: row?.title ?? (es ? article?.title ?? "" : ""), description: row?.description ?? (es ? article?.description ?? "" : "") };
    };
    return { translations: { es: getLocale("es"), en: getLocale("en"), fr: getLocale("fr") }, date: article?.update_date ?? getTodayDate(), imageUrls: [""] };
}

function getTodayDate() {
    return new Date()
        .toISOString()
        .split("T")[0];
}

function formatDate(
    date: string
) {
    if (!date) {
        return "";
    }

    const [year, month, day] =
        date.split("-");

    if (
        !year ||
        !month ||
        !day
    ) {
        return date;
    }

    return `${day}/${month}/${year}`;
}

export default function ProjectArticles({
    projectId
}: Props) {

    const { t, language } = useLanguage();

    const [articles, setArticles] =
        useState<ProjectArticle[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [showForm, setShowForm] =
        useState(false);

    const [editingArticleId, setEditingArticleId] =
        useState<string | null>(null);

    const [form, setForm] =
        useState<ArticleForm>({
            ...emptyForm,
            date: getTodayDate(),
        });

    const [message, setMessage] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    async function loadArticles() {

        setLoading(true);
        setError(null);

        const {
            data,
            error
        } = await supabase
            .from("project_updates")
            .select(
                `
                id,
                project_id,
                title,
                description,
                update_date,
                created_at,
                project_update_translations (id, locale, title, description)
                `
            )
            .eq(
                "project_id",
                projectId
            )
            .order(
                "update_date",
                {
                    ascending: false
                }
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {

            console.error(
                "Error cargando artículos:",
                error
            );

            setArticles([]);
            setError(error.message);
            setLoading(false);

            return;
        }

        setArticles(
            (data ?? []) as ProjectArticle[]
        );

        setLoading(false);
    }

    useEffect(() => {

        loadArticles();

    }, [projectId]);

    function updateForm(field: keyof Omit<ArticleForm, "translations">, value: string | string[]) {
        setForm(prev => ({ ...prev, [field]: value })); setMessage(null); setError(null);
    }
    function updateTranslation(locale: Locale, field: keyof ArticleTranslationForm, value: string) {
        setForm(prev => ({ ...prev, translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [field]: value } } }));
        setMessage(null); setError(null);
    }
    function resetForm() {
        setForm({ ...createArticleForm(), date: getTodayDate() }); setEditingArticleId(null);
    }

    function startCreating() {

        resetForm();

        setMessage(null);
        setError(null);
        setShowForm(true);
    }

    async function startEditing(
        article: ProjectArticle
    ) {

        setMessage(null);
        setError(null);

        const {
            data,
            error
        } = await supabase
            .from("project_update_images")
            .select(
                `
                id,
                update_id,
                image_url,
                sort_order
                `
            )
            .eq(
                "update_id",
                article.id
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );

        if (error) {

            console.error(
                "Error cargando imágenes del artículo:",
                error
            );

            setError(
                "No se han podido cargar las imágenes del artículo."
            );

            return;
        }

        const images =
            (data ?? []) as ProjectArticleImage[];

        setEditingArticleId(
            article.id
        );

        setForm({ ...createArticleForm(article), imageUrls: images.length > 0 ? images.map(image => image.image_url) : [""] });

        setShowForm(true);
    }

    function cancelForm() {

        setShowForm(false);
        resetForm();

        setMessage(null);
        setError(null);
    }

    function addImageField() {

        setForm(prev => ({
            ...prev,
            imageUrls: [
                ...prev.imageUrls,
                ""
            ]
        }));
    }

    function updateImageField(
        index: number,
        value: string
    ) {

        setForm(prev => ({
            ...prev,
            imageUrls:
                prev.imageUrls.map(
                    (
                        url,
                        urlIndex
                    ) =>
                        urlIndex === index
                            ? value
                            : url
                )
        }));

        setMessage(null);
        setError(null);
    }

    function removeImageField(
        index: number
    ) {

        setForm(prev => {

            const newImages =
                prev.imageUrls.filter(
                    (
                        _,
                        imageIndex
                    ) =>
                        imageIndex !== index
                );

            return {
                ...prev,
                imageUrls:
                    newImages.length > 0
                        ? newImages
                        : [""]
            };
        });

        setMessage(null);
        setError(null);
    }

    async function handleSubmit(
        event: React.FormEvent
    ) {

        event.preventDefault();

        setSaving(true);
        setMessage(null);
        setError(null);

        const spanish = form.translations.es;
        const title = spanish.title.trim();
        const date = form.date.trim();
        const description = spanish.description.trim();
        if (locales.some(locale => !form.translations[locale].title.trim() || !form.translations[locale].description.trim())) {
            setError(t.editor_project_article_translation_incomplete); setSaving(false); return;
        }

        if (!date) {

            setError(
                t.editor_project_article_date_invalid
            );

            setSaving(false);

            return;
        }

        const parsedDate =
            new Date(
                `${date}T00:00:00`
            );

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            setError(
                t.editor_project_article_date_invalid
            );

            setSaving(false);

            return;
        }

        const imageUrls =
            form.imageUrls
                .map(
                    url => url.trim()
                )
                .filter(
                    Boolean
                );

        let articleId =
            editingArticleId;

        /*
         * CREAR
         */
        if (!editingArticleId) {

            const {
                data,
                error
            } = await supabase
                .from("project_updates")
                .insert({
                    project_id:
                        projectId,

                    title,

                    description:
                        description || null,

                    update_date:
                        date,
                })
                .select(
                    "id"
                )
                .single();

            if (error) {

                console.error(
                    "Error creando artículo:",
                    error
                );

                setError(
                    error.message
                );

                setSaving(false);

                return;
            }

            articleId =
                data.id;

        }

        /*
         * EDITAR
         */
        else {

            const {
                error
            } = await supabase
                .from("project_updates")
                .update({
                    title,

                    description:
                        description || null,

                    update_date:
                        date,
                })
                .eq(
                    "id",
                    editingArticleId
                );

            if (error) {

                console.error(
                    "Error actualizando artículo:",
                    error
                );

                setError(
                    error.message
                );

                setSaving(false);

                return;
            }

            /*
             * Para mantener el orden de las
             * imágenes tal como están en el formulario,
             * eliminamos las anteriores y las volvemos
             * a insertar.
             */
            const {
                error: deleteImagesError
            } = await supabase
                .from("project_update_images")
                .delete()
                .eq(
                    "update_id",
                    editingArticleId
                );

            if (deleteImagesError) {

                console.error(
                    "Error eliminando imágenes anteriores:",
                    deleteImagesError
                );

                setError(
                    deleteImagesError.message
                );

                setSaving(false);

                return;
            }
        }

        if (!articleId) { setError(t.editor_project_article_save_error); setSaving(false); return; }
        const translationRows = locales.map(locale => ({
            update_id: articleId, locale, title: form.translations[locale].title.trim(),
            description: form.translations[locale].description.trim(), updated_at: new Date().toISOString()
        }));
        const { error: translationError } = await supabase.from("project_update_translations")
            .upsert(translationRows, { onConflict: "update_id,locale" });
        if (translationError) {
            console.error("Error guardando traducciones del artículo:", translationError);
            setError(`${t.editor_project_article_save_error}: ${translationError.message}`);
            setSaving(false); await loadArticles(); return;
        }
        /*
         * GUARDAR IMÁGENES
         */
        if (
            articleId &&
            imageUrls.length > 0
        ) {

            const imageRows =
                imageUrls.map(
                    (
                        imageUrl,
                        index
                    ) => ({
                        update_id:
                            articleId,

                        image_url:
                            imageUrl,

                        sort_order:
                            index,
                    })
                );

            const {
                error
            } = await supabase
                .from("project_update_images")
                .insert(
                    imageRows
                );

            if (error) {

                console.error(
                    "Error guardando imágenes:",
                    error
                );

                setError(
                    error.message
                );

                setSaving(false);

                return;
            }
        }

        setMessage(
            editingArticleId
                ? t.editor_project_article_updated
                : t.editor_project_article_created
        );

        setSaving(false);
        setShowForm(false);
        resetForm();

        await loadArticles();
    }

    async function handleDelete(
        article: ProjectArticle
    ) {

        const confirmed =
            window.confirm(
                `${t.editor_project_article_delete_confirm_title}\n\n` +
                `${t.editor_project_article_delete_confirm_text}`
            );

        if (!confirmed) {
            return;
        }

        setMessage(null);
        setError(null);

        const {
            error
        } = await supabase
            .from("project_updates")
            .delete()
            .eq(
                "id",
                article.id
            );

        if (error) {

            console.error(
                "Error eliminando artículo:",
                error
            );

            setError(
                error.message
            );

            return;
        }

        if (
            editingArticleId ===
            article.id
        ) {
            cancelForm();
        }

        setMessage(
            t.editor_project_article_deleted
        );

        await loadArticles();
    }

    return (

        <div className="project-articles">

            <div className="project-articles-header">

                <h3>
                    {t.editor_project_articles_title}
                </h3>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                        showForm
                            ? cancelForm
                            : startCreating
                    }
                >
                    {showForm
                        ? t.editor_project_article_cancel
                        : `+ ${t.editor_project_articles_add}`}
                </button>

            </div>

            {message && (

                <div className="project-manager-message success">
                    {message}
                </div>

            )}

            {error && (

                <div className="project-manager-message error">
                    {error}
                </div>

            )}

            {showForm && (

                <form
                    className="project-articles-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="project-articles-form-header">

                        <h4>
                            {editingArticleId
                                ? t.editor_project_article_edit
                                : t.editor_project_article_new}
                        </h4>

                    </div>

                    <div className="project-articles-form-row">
                        <div className="project-articles-form-field">
                            <label htmlFor="project-article-date">{t.editor_project_article_date}</label>
                            <input id="project-article-date" className="account-date-input" type="date" value={form.date} onChange={e => updateForm("date", e.target.value)} required />
                        </div>
                    </div>
                    <fieldset className="project-manager-translations">
                        <legend>{t.editor_project_article_translations}</legend>
                        {locales.map(locale => {
                            const label = locale === "es" ? t.editor_news_locale_es : locale === "en" ? t.editor_news_locale_en : t.editor_news_locale_fr;
                            return <section className="project-manager-translation" key={locale}>
                                <h5>{label}</h5>
                                <div className="project-articles-form-field">
                                    <label htmlFor={`project-article-title-${locale}`}>{t.editor_project_article_title}</label>
                                    <input id={`project-article-title-${locale}`} value={form.translations[locale].title} onChange={e => updateTranslation(locale, "title", e.target.value)} required />
                                </div>
                                <div className="project-articles-form-field">
                                    <label htmlFor={`project-article-description-${locale}`}>{t.editor_project_article_description}</label>
                                    <textarea id={`project-article-description-${locale}`} value={form.translations[locale].description} onChange={e => updateTranslation(locale, "description", e.target.value)} rows={5} required />
                                </div>
                            </section>;
                        })}
                    </fieldset>

                    <div className="project-articles-form-field">

                        <label>
                            {
                                t.editor_project_article_images
                            }
                        </label>

                        <div className="project-articles-images">

                            {form.imageUrls.map(
                                (
                                    imageUrl,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className="project-articles-image-row"
                                    >

                                        <input
                                            type="text"
                                            value={
                                                imageUrl
                                            }
                                            placeholder="https://..."
                                            onChange={e =>
                                                updateImageField(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() =>
                                                removeImageField(
                                                    index
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={
                                addImageField
                            }
                        >
                            +{" "}
                            {
                                t.editor_project_article_add_image
                            }
                        </button>

                    </div>

                    <div className="account-actions">

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={
                                cancelForm
                            }
                            disabled={
                                saving
                            }
                        >
                            {
                                t.editor_project_article_cancel
                            }
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                saving
                            }
                        >
                            {
                                saving
                                    ? "..."
                                    : t.editor_project_article_save
                            }
                        </button>

                    </div>

                </form>

            )}

            <div className="project-articles-list">

                {loading ? (

                    <p>
                        {
                            t.editor_project_article_loading
                        }
                    </p>

                ) : articles.length === 0 ? (

                    <p className="project-articles-empty">
                        {
                            t.editor_project_article_no_results
                        }
                    </p>

                ) : (

                    articles.map(
                        article => (

                            <article
                                key={
                                    article.id
                                }
                                className="project-article-item"
                            >

                                <div className="project-article-info">

                                    <span className="project-article-date">
                                        {
                                            formatDate(
                                                article.update_date
                                            )
                                        }
                                    </span>

                                    <h4>
                                        {
                                            resolveLocalizedText(article.project_update_translations,language,"title",article.title) ?? article.title
                                        }
                                    </h4>

                                    {resolveLocalizedText(article.project_update_translations,language,"description",article.description) && (

                                        <p>
                                            {
                                                resolveLocalizedText(article.project_update_translations,language,"description",article.description)
                                            }
                                        </p>

                                    )}

                                </div>

                                <div className="project-article-actions">

                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() =>
                                            startEditing(
                                                article
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        {
                                            t.editor_project_article_edit_button
                                        }
                                    </button>

                                    <button
                                        type="button"
                                        className="btn project-manager-delete-btn"
                                        onClick={() =>
                                            handleDelete(
                                                article
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        {
                                            t.editor_project_article_delete
                                        }
                                    </button>

                                </div>

                            </article>

                        )
                    )

                )}

            </div>

        </div>
    );
}