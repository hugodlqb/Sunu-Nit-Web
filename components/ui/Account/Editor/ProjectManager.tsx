"use client";

import {
    useEffect,
    useState
} from "react";

import ProjectArticles from "./ProjectArticles";
import NewsManager from "./NewsManager";
import { Folder, Newspaper } from "@phosphor-icons/react/dist/ssr";

import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { ContentLocale, ProjectTranslation, normalizeContentTranslations, resolveLocalizedText } from "@/lib/project-translations";

import "@/styles/projectmanager.css";

type Locale = ContentLocale;
const locales: Locale[] = ["es", "en", "fr"];
interface Project {
 id:string; key:string; name:string; description:string|null; image:string|null;
 target_amount:number|null; current_amount:number; currency:string; status:string;
 active:boolean; show_in_projects:boolean; detail_description:string|null; created_at:string;
 project_translations:ProjectTranslation[]|ProjectTranslation|null;
}
interface ProjectTranslationForm {name:string;description:string;detail_description:string;}
interface ProjectForm {translations:Record<Locale,ProjectTranslationForm>;image:string;target_amount:string;year:string;active:boolean;show_in_projects:boolean;}
const emptyTranslation:ProjectTranslationForm={name:"",description:"",detail_description:""};
const emptyForm:ProjectForm={translations:{es:{...emptyTranslation},en:{...emptyTranslation},fr:{...emptyTranslation}},image:"",target_amount:"",year:new Date().getFullYear().toString(),active:true,show_in_projects:false};
function createProjectForm(project?:Project):ProjectForm {
 const rows=normalizeContentTranslations(project?.project_translations);
 const getLocale=(locale:Locale):ProjectTranslationForm=>{const row=rows.find(item=>item.locale===locale);const es=locale==="es";return {
  name:row?.name??(es?project?.name??"":""),
  description:row?.description??(es?project?.description??"":""),
  detail_description:row?.detail_description??(es?project?.detail_description??"":""),
 };};
 return {translations:{es:getLocale("es"),en:getLocale("en"),fr:getLocale("fr")},image:project?.image??"",target_amount:project?.target_amount!=null?String(project.target_amount):"",year:project?getProjectYear(project.created_at):new Date().getFullYear().toString(),active:project?.active??true,show_in_projects:project?.show_in_projects??false};
}

function createProjectKey(
    name: string
) {

    const slug = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${slug || "project"}-${Date.now().toString(36)}`;
}

function getProjectYear(
    createdAt: string
) {

    return new Date(
        createdAt
    ).getFullYear().toString();
}

function changeProjectYear(
    createdAt: string,
    year: string
) {

    const date =
        new Date(createdAt);

    date.setFullYear(
        Number(year)
    );

    return date.toISOString();
}

export default function ProjectManager() {

    const { t, language } = useLanguage();

    const [activeTab, setActiveTab] =
        useState<"projects" | "news">("projects");

    const [projects, setProjects] =
        useState<Project[]>([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editingProjectId, setEditingProjectId] =
        useState<string | null>(null);

    const [articlesProjectId, setArticlesProjectId] =
        useState<string | null>(null);

    const [showForm, setShowForm] =
        useState(false);

    const [form, setForm] =
        useState<ProjectForm>(
            emptyForm
        );

    const [message, setMessage] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    async function loadProjects(
        searchValue = ""
    ) {

        setLoading(true);
        setError(null);

        let query = supabase
            .from("projects")
            .select(
                `
                id,
                key,
                name,
                description,
                image,
                target_amount,
                current_amount,
                currency,
                status,
                active,
                show_in_projects,
                detail_description,
                created_at,
                project_translations (id, locale, name, description, detail_description)
                `
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        const trimmedSearch =
            searchValue.trim();

        if (trimmedSearch) {

            query = query.ilike(
                "name",
                `%${trimmedSearch}%`
            );
        }

        const {
            data,
            error
        } = await query;

        if (error) {

            console.error(
                "Error cargando proyectos:",
                error
            );

            setProjects([]);
            setError(
                error.message
            );
            setLoading(false);

            return;
        }

        setProjects(
            (data ?? []) as Project[]
        );

        setLoading(false);
    }

    useEffect(() => {

        loadProjects();

    }, []);

    function updateForm(field:keyof Omit<ProjectForm,"translations">,value:string|boolean) {
        setForm(prev=>({...prev,[field]:value}));setMessage(null);setError(null);
    }
    function updateTranslation(locale:Locale,field:keyof ProjectTranslationForm,value:string) {
        setForm(prev=>({...prev,translations:{...prev.translations,[locale]:{...prev.translations[locale],[field]:value}}}));
        setMessage(null);setError(null);
    }
    function startCreating() {
        setEditingProjectId(null);setArticlesProjectId(null);setForm(createProjectForm());
        setMessage(null);setError(null);setShowForm(true);
    }
    function startEditing(project:Project) {
        if(editingProjectId===project.id){cancelForm();return;}
        setArticlesProjectId(null);setShowForm(false);setEditingProjectId(project.id);
        setForm(createProjectForm(project));setMessage(null);setError(null);
    }
    function toggleArticles(projectId:string) {
        setMessage(null);setError(null);
        if(articlesProjectId===projectId){setArticlesProjectId(null);return;}
        setEditingProjectId(null);setShowForm(false);setArticlesProjectId(projectId);
    }
    function cancelForm() {
        setShowForm(false);setEditingProjectId(null);setForm(createProjectForm());
        setMessage(null);setError(null);
    }

    async function handleSubmit(
        event: React.FormEvent
    ) {

        event.preventDefault();

        setSaving(true);
        setMessage(null);
        setError(null);

        const spanish = form.translations.es;
        const name = spanish.name.trim();
        if (locales.some(locale => !form.translations[locale].name.trim() || !form.translations[locale].description.trim() || !form.translations[locale].detail_description.trim())) {
            setError(t.editor_projects_translation_incomplete); setSaving(false); return;
        }

        const targetAmount =
            form.target_amount.trim() === ""
                ? null
                : Number(
                    form.target_amount
                );

        if (
            targetAmount !== null &&
            (
                !Number.isFinite(
                    targetAmount
                ) ||
                targetAmount < 0
            )
        ) {

            setError(
                t.editor_projects_invalid_target
            );

            setSaving(false);

            return;
        }

        const projectYear =
            Number(
                form.year.trim()
            );

        if (
            !Number.isInteger(
                projectYear
            ) ||
            projectYear < 1900 ||
            projectYear > 2100
        ) {

            setError(
                t.editor_projects_invalid_year
            );

            setSaving(false);

            return;
        }

        const projectData = {

            name,

            description: spanish.description.trim(),

            image:
                form.image.trim() ||
                null,

            target_amount:
                targetAmount,

            active:
                form.active,

            show_in_projects:
                form.show_in_projects,

            detail_description: spanish.detail_description.trim(),
        };

        let savedProjectId: string | null = editingProjectId;
        /*
         * CREAR PROYECTO
         */
        if (!editingProjectId) {

            const createdAt =
                new Date();

            createdAt.setFullYear(
                projectYear
            );

            const { data: createdProject, error } = await supabase
                .from("projects")
                .insert({

                    key:
                        createProjectKey(
                            name
                        ),

                    currency:
                        "EUR",

                    status:
                        "active",

                    current_amount:
                        0,

                    created_at:
                        createdAt.toISOString(),

                    ...projectData
                })
                .select("id")
                .single();

            if (error) {

                console.error(
                    "Error creando proyecto:",
                    error
                );

                setError(
                    error.message
                );

                setSaving(false);

                return;
            }

            savedProjectId = createdProject.id;
            setMessage(t.editor_projects_created);
        }

        /*
         * EDITAR PROYECTO
         */
        else {

            const project =
                projects.find(
                    item =>
                        item.id ===
                        editingProjectId
                );

            if (!project) {

                setError(
                    t.editor_projects_not_found
                );

                setSaving(false);

                return;
            }

            const updatedCreatedAt =
                changeProjectYear(
                    project.created_at,
                    form.year
                );

            const {
                error
            } = await supabase
                .from("projects")
                .update({
                    ...projectData,

                    created_at:
                        updatedCreatedAt
                })
                .eq(
                    "id",
                    editingProjectId
                );

            if (error) {

                console.error(
                    "Error actualizando proyecto:",
                    error
                );

                setError(
                    error.message
                );

                setSaving(false);

                return;
            }

            setMessage(
                t.editor_projects_updated
            );
        }

        if (!savedProjectId) { setError(t.editor_projects_save_error); setSaving(false); return; }
        const translationRows = locales.map(locale => ({
            project_id:savedProjectId,locale,name:form.translations[locale].name.trim(),
            description:form.translations[locale].description.trim(),
            detail_description:form.translations[locale].detail_description.trim(),
            updated_at:new Date().toISOString()
        }));
        const {error:translationError}=await supabase.from("project_translations")
            .upsert(translationRows,{onConflict:"project_id,locale"});
        if(translationError){
            console.error("Error guardando traducciones del proyecto:",translationError);
            setError(`${t.editor_projects_save_error}: ${translationError.message}`);
            setSaving(false);await loadProjects(search);return;
        }
        await loadProjects(
            search
        );

        setSaving(false);
        cancelForm();
    }

    async function handleDelete(
        project: Project
    ) {

        setMessage(null);
        setError(null);

        /*
         * Volvemos a consultar el importe
         * directamente en Supabase.
         */
        const {
            data,
            error: fetchError
        } = await supabase
            .from("projects")
            .select(
                "name, current_amount"
            )
            .eq(
                "id",
                project.id
            )
            .single();

        if (fetchError) {

            console.error(
                "Error comprobando el proyecto antes de eliminar:",
                fetchError
            );

            setError(
                t.editor_projects_delete_check_error
            );

            return;
        }

        const currentAmount =
            Number(
                data?.current_amount ?? 0
            );

        /*
         * No permitimos borrar proyectos
         * que tengan dinero recaudado.
         */
        if (currentAmount > 0) {

            window.alert(
                t.editor_projects_delete_blocked_title.replace("{name}", data.name).replace("{amount}", currentAmount.toFixed(2)) + "\n\n" + t.editor_projects_delete_blocked_body
            );

            return;
        }

        /*
         * Confirmación final.
         */
        const confirmed =
            window.confirm(
                `${t.editor_projects_delete_confirm_title}\n\n` +
                `${t.editor_projects_delete_confirm_text}`
            );

        if (!confirmed) {
            return;
        }

        const {
            error: deleteError
        } = await supabase
            .from("projects")
            .delete()
            .eq(
                "id",
                project.id
            );

        if (deleteError) {

            console.error(
                "Error eliminando proyecto:",
                deleteError
            );

            setError(
                `${t.editor_projects_delete_error} ${deleteError.message}`
            );

            return;
        }

        if (
            editingProjectId ===
            project.id
        ) {
            cancelForm();
        }

        if (
            articlesProjectId ===
            project.id
        ) {
            setArticlesProjectId(null);
        }

        setMessage(
            t.editor_projects_deleted
        );

        await loadProjects(
            search
        );
    }

    const groupedProjects =
        projects.reduce(
            (
                groups:
                    Record<
                        string,
                        Project[]
                    >,
                project
            ) => {

                const year =
                    getProjectYear(
                        project.created_at
                    );

                if (!groups[year]) {
                    groups[year] = [];
                }

                groups[year].push(
                    project
                );

                return groups;

            },
            {}
        );

    const years =
        Object.keys(
            groupedProjects
        ).sort(
            (a, b) =>
                Number(b) -
                Number(a)
        );

    const latestYear =
        years[0] ?? null;

    return (

        <div className="editor-manager">

            <div className="editor-manager-tabs" role="tablist" aria-label={t.editor_tabs_label}>
                <button
                    type="button"
                    role="tab"
                    id="editor-tab-projects"
                    aria-selected={activeTab === "projects"}
                    aria-controls="editor-panel-projects"
                    className={`editor-manager-tab ${activeTab === "projects" ? "active" : ""}`}
                    onClick={() => setActiveTab("projects")}
                >
                    <Folder size={20} weight="bold" />
                    <span>{t.editor_tab_projects}</span>
                </button>

                <button
                    type="button"
                    role="tab"
                    id="editor-tab-news"
                    aria-selected={activeTab === "news"}
                    aria-controls="editor-panel-news"
                    className={`editor-manager-tab ${activeTab === "news" ? "active" : ""}`}
                    onClick={() => setActiveTab("news")}
                >
                    <Newspaper size={20} weight="bold" />
                    <span>{t.editor_tab_news}</span>
                </button>
            </div>

            <div
                id="editor-panel-projects"
                role="tabpanel"
                aria-labelledby="editor-tab-projects"
                hidden={activeTab !== "projects"}
            >

        <div className="project-manager">

            <div className="project-manager-header">

                <div>

                    <h2>
                        {
                            t.editor_projects_title
                        }
                    </h2>

                    <p className="project-manager-subtitle">
                        {t.editor_projects_subtitle}
                    </p>

                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                        startCreating
                    }
                >
                    +
                    {" "}
                    {
                        t.editor_projects_create
                    }
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

            <div className="project-manager-search">

                <input
                    type="text"
                    value={search}
                    placeholder={
                        t.editor_projects_search
                    }
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                        loadProjects(
                            search
                        )
                    }
                    disabled={
                        loading
                    }
                >
                    Buscar
                </button>

            </div>

            {showForm && (

                <form
                    className="project-manager-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="project-manager-form-header">

                        <h3>
                            {
                                t.editor_projects_new
                            }
                        </h3>

                    </div>

                    <div className="project-manager-form-row">
                        <div className="project-manager-form-field">
                            <label>{t.editor_projects_target}</label>
                            <input type="number" min="0" step="0.01" value={form.target_amount} onChange={e=>updateForm("target_amount",e.target.value)} />
                        </div>
                        <div className="project-manager-form-field">
                            <label>{t.editor_projects_year}</label>
                            <input type="number" min="1900" max="2100" value={form.year} onChange={e=>updateForm("year",e.target.value)} required />
                        </div>
                        <div className="project-manager-form-field">
                            <label>{t.editor_projects_image}</label>
                            <input type="text" value={form.image} placeholder="https://..." onChange={e=>updateForm("image",e.target.value)} />
                        </div>
                    </div>
                    <fieldset className="project-manager-translations">
                        <legend>{t.editor_projects_translations}</legend>
                        {locales.map(locale=>{
                            const label=locale==="es"?t.editor_news_locale_es:locale==="en"?t.editor_news_locale_en:t.editor_news_locale_fr;
                            return <section className="project-manager-translation" key={locale}>
                                <h4>{label}</h4>
                                <div className="project-manager-form-field">
                                    <label htmlFor={`project-name-${locale}`}>{t.editor_projects_name}</label>
                                    <input id={`project-name-${locale}`} value={form.translations[locale].name} onChange={e=>updateTranslation(locale,"name",e.target.value)} required />
                                </div>
                                <div className="project-manager-form-field">
                                    <label htmlFor={`project-description-${locale}`}>{t.editor_projects_description}</label>
                                    <textarea id={`project-description-${locale}`} value={form.translations[locale].description} onChange={e=>updateTranslation(locale,"description",e.target.value)} rows={2} required />
                                </div>
                                <div className="project-manager-form-field">
                                    <label htmlFor={`project-detail-description-${locale}`}>{t.editor_projects_detail_description}</label>
                                    <textarea id={`project-detail-description-${locale}`} value={form.translations[locale].detail_description} onChange={e=>updateTranslation(locale,"detail_description",e.target.value)} rows={5} required />
                                </div>
                            </section>;
                        })}
                    </fieldset>

                    <div className="project-manager-checkboxes">

                        <label className="project-manager-checkbox">

                            <input
                                type="checkbox"
                                checked={
                                    form.active
                                }
                                onChange={e =>
                                    updateForm(
                                        "active",
                                        e.target.checked
                                    )
                                }
                            />

                            <span>
                                {
                                    t.editor_projects_active
                                }
                            </span>

                        </label>

                        <label className="project-manager-checkbox">

                            <input
                                type="checkbox"
                                checked={
                                    form.show_in_projects
                                }
                                onChange={e =>
                                    updateForm(
                                        "show_in_projects",
                                        e.target.checked
                                    )
                                }
                            />

                            <span>
                                {
                                    t.editor_projects_show
                                }
                            </span>

                        </label>

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
                                t.editor_projects_cancel
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
                                    : t.editor_projects_create_button
                            }
                        </button>

                    </div>

                </form>

            )}

            <div className="project-manager-list">

                {loading ? (

                    <p>
                        {
                            t.editor_projects_loading
                        }
                    </p>

                ) : projects.length === 0 ? (

                    <p className="project-manager-empty">
                        {
                            t.editor_projects_no_results
                        }
                    </p>

                ) : (

                    years.map(
                        year => (

                            <details
                                key={year}
                                className="project-manager-year"
                                open={
                                    year ===
                                    latestYear
                                }
                            >

                                <summary>

                                    <span>
                                        {year}
                                    </span>

                                    <span className="project-manager-year-count">
                                        {
                                            groupedProjects[
                                                year
                                            ].length
                                        }
                                    </span>

                                </summary>

                                <div className="project-manager-year-list">

                                    {
                                        groupedProjects[
                                            year
                                        ].map(
                                            project => (

                                                <div
                                                    key={
                                                        project.id
                                                    }
                                                    className="project-manager-item-wrapper"
                                                >

                                                    <article
                                                        className="project-manager-item"
                                                    >

                                                        <div className="project-manager-item-info">

                                                            <h3>
                                                                {
                                                                    resolveLocalizedText(project.project_translations,language,"name",project.name) ?? project.name
                                                                }
                                                            </h3>

                                                            <p>
                                                                {
                                                                    resolveLocalizedText(project.project_translations,language,"description",project.description) || "—"
                                                                }
                                                            </p>

                                                            <div className="project-manager-item-meta">

                                                                <span
                                                                    className={
                                                                        project.active
                                                                            ? "is-active"
                                                                            : "is-inactive"
                                                                    }
                                                                >
                                                                    {
                                                                        project.active
                                                                            ? t.project_status_active
                                                                            : t.project_status_inactive
                                                                    }
                                                                </span>

                                                                <span
                                                                    className={
                                                                        project.show_in_projects
                                                                            ? "is-visible"
                                                                            : "is-hidden"
                                                                    }
                                                                >
                                                                    {
                                                                        project.show_in_projects
                                                                            ? t.project_visibility_visible
                                                                            : t.project_visibility_hidden
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                        <div className="project-manager-item-actions">

                                                            <button
                                                                type="button"
                                                                className={
                                                                    articlesProjectId === project.id
                                                                        ? "btn project-manager-articles-active"
                                                                        : "btn btn-outline"
                                                                }
                                                                onClick={() =>
                                                                    toggleArticles(
                                                                        project.id
                                                                    )
                                                                }
                                                            >
                                                                {t.editor_projects_articles}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline"
                                                                onClick={() =>
                                                                    startEditing(
                                                                        project
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    editingProjectId ===
                                                                        project.id
                                                                        ? t.editor_projects_cancel
                                                                        : t.editor_projects_edit
                                                                }
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn project-manager-delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        project
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving
                                                                }
                                                            >
                                                                {
                                                                    t.editor_projects_delete
                                                                }
                                                            </button>

                                                        </div>

                                                    </article>

                                                    {articlesProjectId ===
                                                        project.id && (

                                                            <div className="project-manager-inline-panel">

                                                                <ProjectArticles
                                                                    projectId={
                                                                        project.id
                                                                    }
                                                                />

                                                            </div>

                                                        )}

                                                    {editingProjectId ===
                                                        project.id && (

                                                            <form
                                                                className="project-manager-inline-form"
                                                                onSubmit={
                                                                    handleSubmit
                                                                }
                                                            >

                                                                <div className="project-manager-form-header">

                                                                    <h3>
                                                                        {
                                                                            t.editor_projects_edit
                                                                        }
                                                                    </h3>

                                                                </div>

                    <div className="project-manager-form-row">
                        <div className="project-manager-form-field">
                            <label>{t.editor_projects_target}</label>
                            <input type="number" min="0" step="0.01" value={form.target_amount} onChange={e=>updateForm("target_amount",e.target.value)} />
                        </div>
                        <div className="project-manager-form-field">
                            <label>{t.editor_projects_year}</label>
                            <input type="number" min="1900" max="2100" value={form.year} onChange={e=>updateForm("year",e.target.value)} required />
                        </div>
                        <div className="project-manager-form-field">
                            <label>{t.editor_projects_image}</label>
                            <input type="text" value={form.image} placeholder="https://..." onChange={e=>updateForm("image",e.target.value)} />
                        </div>
                    </div>
                    <fieldset className="project-manager-translations">
                        <legend>{t.editor_projects_translations}</legend>
                        {locales.map(locale=>{
                            const label=locale==="es"?t.editor_news_locale_es:locale==="en"?t.editor_news_locale_en:t.editor_news_locale_fr;
                            return <section className="project-manager-translation" key={locale}>
                                <h4>{label}</h4>
                                <div className="project-manager-form-field">
                                    <label htmlFor={`project-inline-name-${locale}`}>{t.editor_projects_name}</label>
                                    <input id={`project-inline-name-${locale}`} value={form.translations[locale].name} onChange={e=>updateTranslation(locale,"name",e.target.value)} required />
                                </div>
                                <div className="project-manager-form-field">
                                    <label htmlFor={`project-inline-description-${locale}`}>{t.editor_projects_description}</label>
                                    <textarea id={`project-inline-description-${locale}`} value={form.translations[locale].description} onChange={e=>updateTranslation(locale,"description",e.target.value)} rows={2} required />
                                </div>
                                <div className="project-manager-form-field">
                                    <label htmlFor={`project-inline-detail-description-${locale}`}>{t.editor_projects_detail_description}</label>
                                    <textarea id={`project-inline-detail-description-${locale}`} value={form.translations[locale].detail_description} onChange={e=>updateTranslation(locale,"detail_description",e.target.value)} rows={5} required />
                                </div>
                            </section>;
                        })}
                    </fieldset>

                                                                <div className="project-manager-checkboxes">

                                                                    <label className="project-manager-checkbox">

                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                form.active
                                                                            }
                                                                            onChange={e =>
                                                                                updateForm(
                                                                                    "active",
                                                                                    e.target.checked
                                                                                )
                                                                            }
                                                                        />

                                                                        <span>
                                                                            {
                                                                                t.editor_projects_active
                                                                            }
                                                                        </span>

                                                                    </label>

                                                                    <label className="project-manager-checkbox">

                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                form.show_in_projects
                                                                            }
                                                                            onChange={e =>
                                                                                updateForm(
                                                                                    "show_in_projects",
                                                                                    e.target.checked
                                                                                )
                                                                            }
                                                                        />

                                                                        <span>
                                                                            {
                                                                                t.editor_projects_show
                                                                            }
                                                                        </span>

                                                                    </label>

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
                                                                            t.editor_projects_cancel
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
                                                                                : t.editor_projects_save
                                                                        }
                                                                    </button>

                                                                </div>

                                                            </form>

                                                        )}

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            </details>

                        )
                    )

                )}

            </div>

        </div>

            </div>

            <div
                id="editor-panel-news"
                role="tabpanel"
                aria-labelledby="editor-tab-news"
                hidden={activeTab !== "news"}
            >
                <NewsManager />
            </div>

        </div>
    );
}