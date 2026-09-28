"use client";

import {
    useEffect,
    useState
} from "react";

import ProjectArticles from "./ProjectArticles";

import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

import "@/styles/projectmanager.css";

interface Project {
    id: string;
    key: string;
    name: string;
    description: string | null;
    image: string | null;
    target_amount: number | null;
    current_amount: number;
    currency: string;
    status: string;
    active: boolean;
    show_in_projects: boolean;
    detail_description: string | null;
    created_at: string;
}

interface ProjectForm {
    name: string;
    description: string;
    image: string;
    target_amount: string;
    year: string;
    active: boolean;
    show_in_projects: boolean;
    detail_description: string;
}

const emptyForm: ProjectForm = {
    name: "",
    description: "",
    image: "",
    target_amount: "",
    year: new Date().getFullYear().toString(),
    active: true,
    show_in_projects: false,
    detail_description: "",
};

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

    const { t } = useLanguage();

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
                created_at
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

    function updateForm(
        field: keyof ProjectForm,
        value: string | boolean
    ) {

        setForm(prev => ({
            ...prev,
            [field]: value
        }));

        setMessage(null);
        setError(null);
    }

    function startCreating() {

        setEditingProjectId(null);
        setArticlesProjectId(null);

        setForm({
            ...emptyForm,
            year:
                new Date()
                    .getFullYear()
                    .toString()
        });

        setMessage(null);
        setError(null);
        setShowForm(true);
    }

    function startEditing(
        project: Project
    ) {

        if (
            editingProjectId ===
            project.id
        ) {

            cancelForm();

            return;
        }

        setArticlesProjectId(null);
        setShowForm(false);

        setEditingProjectId(
            project.id
        );

        setForm({
            name:
                project.name ?? "",

            description:
                project.description ?? "",

            image:
                project.image ?? "",

            target_amount:
                project.target_amount !== null
                    ? String(
                        project.target_amount
                    )
                    : "",

            year:
                getProjectYear(
                    project.created_at
                ),

            active:
                project.active,

            show_in_projects:
                project.show_in_projects,

            detail_description:
                project.detail_description ?? "",
        });

        setMessage(null);
        setError(null);
    }

    function toggleArticles(
        projectId: string
    ) {

        setMessage(null);
        setError(null);

        if (
            articlesProjectId ===
            projectId
        ) {

            setArticlesProjectId(
                null
            );

            return;
        }

        setEditingProjectId(null);
        setShowForm(false);

        setArticlesProjectId(
            projectId
        );
    }

    function cancelForm() {

        setShowForm(false);
        setEditingProjectId(null);

        setForm({
            ...emptyForm,
            year:
                new Date()
                    .getFullYear()
                    .toString()
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

        const name =
            form.name.trim();

        if (!name) {

            setError(
                "El nombre del proyecto es obligatorio."
            );

            setSaving(false);

            return;
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
                "El objetivo económico no es válido."
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
                "El año del proyecto no es válido."
            );

            setSaving(false);

            return;
        }

        const projectData = {

            name,

            description:
                form.description.trim() ||
                null,

            image:
                form.image.trim() ||
                null,

            target_amount:
                targetAmount,

            active:
                form.active,

            show_in_projects:
                form.show_in_projects,

            detail_description:
                form.detail_description.trim() ||
                null,
        };

        /*
         * CREAR PROYECTO
         */
        if (!editingProjectId) {

            const createdAt =
                new Date();

            createdAt.setFullYear(
                projectYear
            );

            const {
                error
            } = await supabase
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
                });

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

            setMessage(
                t.editor_projects_created
            );
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
                    "No se ha encontrado el proyecto que estás editando."
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
                "No se ha podido comprobar el dinero recaudado del proyecto."
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
                `El proyecto "${data.name}" tiene actualmente ${currentAmount.toFixed(2)} € recaudados.\n\n` +
                `No se puede eliminar un proyecto que tenga dinero asociado.\n\n` +
                `Contacta con un administrador para gestionar este caso.`
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
                `No se ha podido eliminar el proyecto: ${deleteError.message}`
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

        <div className="project-manager">

            <div className="project-manager-header">

                <div>

                    <h2>
                        {
                            t.editor_projects_title
                        }
                    </h2>

                    <p className="project-manager-subtitle">
                        Gestiona los proyectos y su
                        visibilidad pública.
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

                            <label>
                                {
                                    t.editor_projects_name
                                }
                            </label>

                            <input
                                type="text"
                                value={
                                    form.name
                                }
                                onChange={e =>
                                    updateForm(
                                        "name",
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <div className="project-manager-form-field">

                            <label>
                                {
                                    t.editor_projects_target
                                }
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    form.target_amount
                                }
                                onChange={e =>
                                    updateForm(
                                        "target_amount",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    <div className="project-manager-form-row">

                        <div className="project-manager-form-field">

                            <label>
                                Año
                            </label>

                            <input
                                type="number"
                                min="1900"
                                max="2100"
                                value={
                                    form.year
                                }
                                onChange={e =>
                                    updateForm(
                                        "year",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="project-manager-form-field">

                            <label>
                                {
                                    t.editor_projects_image
                                }
                            </label>

                            <input
                                type="text"
                                value={
                                    form.image
                                }
                                onChange={e =>
                                    updateForm(
                                        "image",
                                        e.target.value
                                    )
                                }
                                placeholder="https://..."
                            />

                        </div>

                    </div>

                    <div className="project-manager-form-field">

                        <label>
                            {
                                t.editor_projects_description
                            }
                        </label>

                        <textarea
                            value={
                                form.description
                            }
                            onChange={e =>
                                updateForm(
                                    "description",
                                    e.target.value
                                )
                            }
                            rows={2}
                        />

                    </div>

                    <div className="project-manager-form-field">

                        <label>
                            {
                                t.editor_projects_detail_description
                            }
                        </label>

                        <textarea
                            value={
                                form.detail_description
                            }
                            onChange={e =>
                                updateForm(
                                    "detail_description",
                                    e.target.value
                                )
                            }
                            rows={5}
                        />

                    </div>

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
                                                                    project.name
                                                                }
                                                            </h3>

                                                            <p>
                                                                {
                                                                    project.description ||
                                                                    "—"
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
                                                                            ? "Activo"
                                                                            : "Inactivo"
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
                                                                            ? "Visible en Proyectos"
                                                                            : "Oculto en Proyectos"
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
                                                                Artículos
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

                                                                        <label>
                                                                            {
                                                                                t.editor_projects_name
                                                                            }
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                form.name
                                                                            }
                                                                            onChange={e =>
                                                                                updateForm(
                                                                                    "name",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            required
                                                                        />

                                                                    </div>

                                                                    <div className="project-manager-form-field">

                                                                        <label>
                                                                            {
                                                                                t.editor_projects_target
                                                                            }
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={
                                                                                form.target_amount
                                                                            }
                                                                            onChange={e =>
                                                                                updateForm(
                                                                                    "target_amount",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />

                                                                    </div>

                                                                </div>

                                                                <div className="project-manager-form-row">

                                                                    <div className="project-manager-form-field">

                                                                        <label>
                                                                            Año
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min="1900"
                                                                            max="2100"
                                                                            value={
                                                                                form.year
                                                                            }
                                                                            onChange={e =>
                                                                                updateForm(
                                                                                    "year",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />

                                                                    </div>

                                                                    <div className="project-manager-form-field">

                                                                        <label>
                                                                            {
                                                                                t.editor_projects_image
                                                                            }
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                form.image
                                                                            }
                                                                            onChange={e =>
                                                                                updateForm(
                                                                                    "image",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="https://..."
                                                                        />

                                                                    </div>

                                                                </div>

                                                                <div className="project-manager-form-field">

                                                                    <label>
                                                                        {
                                                                            t.editor_projects_description
                                                                        }
                                                                    </label>

                                                                    <textarea
                                                                        value={
                                                                            form.description
                                                                        }
                                                                        onChange={e =>
                                                                            updateForm(
                                                                                "description",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        rows={2}
                                                                    />

                                                                </div>

                                                                <div className="project-manager-form-field">

                                                                    <label>
                                                                        {
                                                                            t.editor_projects_detail_description
                                                                        }
                                                                    </label>

                                                                    <textarea
                                                                        value={
                                                                            form.detail_description
                                                                        }
                                                                        onChange={e =>
                                                                            updateForm(
                                                                                "detail_description",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        rows={5}
                                                                    />

                                                                </div>

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
    );
}