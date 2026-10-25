"use client";

import {
    useEffect,
    useState
} from "react";

import { createPortal } from "react-dom";

import {
    X
} from "@phosphor-icons/react/dist/ssr";

import {
    Swiper,
    SwiperSlide
} from "swiper/react";

import {
    Navigation,
    Pagination
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "@/styles/detailsmodal.css";

import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { ProjectTranslation, ProjectUpdateTranslation, resolveLocalizedText } from "@/lib/project-translations";


interface ProjectUpdateImage {

    id: string;
    image_url: string;
    sort_order: number;

}


interface ProjectUpdate {

    id: string;
    title: string;
    description: string | null;
    update_date: string;
    project_update_images: ProjectUpdateImage[];
    project_update_translations: ProjectUpdateTranslation[] | ProjectUpdateTranslation | null;

}


interface ProjectDetail {

    id: string;
    name: string;
    detail_description: string | null;
    project_translations: ProjectTranslation[] | ProjectTranslation | null;
    project_updates: ProjectUpdate[];

}

interface Props {

    projectId: string;
    onClose: () => void;
    onDonate?: (
        projectId: string,
        projectName: string
    ) => void;

}

export default function ProjectModal({

    projectId,
    onClose,
    onDonate

}: Props) {

    const { t, language } = useLanguage();

    const [project, setProject] =
        useState<ProjectDetail | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [mounted, setMounted] =
        useState(false);


    useEffect(() => {

        setMounted(true);

    }, []);


    useEffect(() => {

        async function loadProject() {

            setLoading(true);
            setError(null);

            const {
                data,
                error
            } = await supabase

                .from("projects")

                .select(
                    `
                    id,
                    name,
                    detail_description,
                    project_translations (locale, name, description, detail_description),

                    project_updates (

                        id,
                        title,
                        description,
                        update_date,
                        project_update_translations (locale, title, description),

                        project_update_images (

                            id,
                            image_url,
                            sort_order

                        )

                    )
                    `
                )

                .eq(
                    "id",
                    projectId
                )

                .maybeSingle();


            if (error) {

                console.error(
                    "========== ERROR CARGANDO PROYECTO =========="
                );

                console.error(
                    "message:",
                    error.message
                );

                console.error(
                    "code:",
                    error.code
                );

                console.error(
                    "details:",
                    error.details
                );

                console.error(
                    "hint:",
                    error.hint
                );

                console.error(
                    "============================================="
                );

                setError(
                    t.project_modal_load_error
                );

                setLoading(false);

                return;
            }


            if (!data) {

                setError(
                    t.project_modal_not_found
                );

                setLoading(false);

                return;
            }


            const projectData =
                data as ProjectDetail;


            projectData.project_updates =
                [...projectData.project_updates]

                    .sort(
                        (a, b) =>
                            new Date(
                                b.update_date
                            ).getTime() -
                            new Date(
                                a.update_date
                            ).getTime()
                    )

                    .map(update => ({

                        ...update,

                        project_update_images:
                            [
                                ...update.project_update_images
                            ]

                                .sort(
                                    (a, b) =>
                                        a.sort_order -
                                        b.sort_order
                                )

                    }));


            setProject(
                projectData
            );

            setLoading(false);

        }


        loadProject();

    }, [projectId]);


    if (!mounted) {

        return null;

    }


    return createPortal(

        <div
            className="activity-modal-overlay project-modal-overlay"
            onClick={onClose}
        >

            <div
                className="activity-modal project-modal"
                onClick={e =>
                    e.stopPropagation()
                }
            >

                <button
                    type="button"
                    className="activity-close"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>


                {loading && (

                    <div className="activity-content project-modal-content">

                        <div className="activity-update">

                            <p>
                                {t.projects_loading}
                            </p>

                        </div>

                    </div>

                )}


                {!loading && error && (

                    <div className="activity-content project-modal-content">

                        <div className="activity-update">

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {!loading &&
                    !error &&
                    project && (

                        <>

                            <div className="activity-header project-modal-header">

                                <div className="project-modal-header-info">

                                    <h2>
                                        {resolveLocalizedText(project.project_translations,language,"name",project.name) ?? project.name}
                                    </h2>

                                    {resolveLocalizedText(project.project_translations,language,"detail_description",project.detail_description) && (
                                        <p className="activity-summary">
                                            {resolveLocalizedText(project.project_translations,language,"detail_description",project.detail_description)}
                                        </p>
                                    )}

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary project-modal-donate-btn"
                                    onClick={() =>
                                        onDonate?.(
                                            project.id,
                                            resolveLocalizedText(project.project_translations,language,"name",project.name) ?? project.name
                                        )
                                    }
                                >
                                    {t.project_collaborated}
                                </button>

                            </div>

                            <div className="activity-content project-modal-content">

                                <div className="activity-updates">

                                    {
                                        project.project_updates.length === 0 ? (

                                            <div className="activity-update">

                                                <p>
                                                    {t.project_no_updates}
                                                </p>

                                            </div>

                                        ) : (

                                            project.project_updates.map(

                                                (update, index) => (

                                                    <article
                                                        key={update.id}
                                                        className={`activity-update ${index % 2 === 0
                                                            ? "update-beige"
                                                            : "update-light"
                                                            }`}
                                                    >

                                                        {
                                                            update.project_update_images.length > 0 && (

                                                                <div className="activity-swiper">

                                                                    <Swiper

                                                                        modules={[
                                                                            Navigation,
                                                                            Pagination
                                                                        ]}

                                                                        navigation

                                                                        pagination={{
                                                                            clickable: true
                                                                        }}

                                                                        slidesPerView={1}

                                                                    >

                                                                        {
                                                                            update.project_update_images.map(

                                                                                image => (

                                                                                    <SwiperSlide
                                                                                        key={image.id}
                                                                                    >

                                                                                        <div className="activity-update-image">

                                                                                            <img
                                                                                                src={
                                                                                                    image.image_url
                                                                                                }
                                                                                                alt={resolveLocalizedText(update.project_update_translations,language,"title",update.title) ?? update.title}
                                                                                            />

                                                                                        </div>

                                                                                    </SwiperSlide>

                                                                                )

                                                                            )
                                                                        }

                                                                    </Swiper>

                                                                </div>

                                                            )
                                                        }


                                                        <span className="activity-date">

                                                            {
                                                                new Date(
                                                                    update.update_date +
                                                                    "T00:00:00"
                                                                ).toLocaleDateString(
                                                                    undefined,
                                                                    {
                                                                        day: "numeric",
                                                                        month: "long",
                                                                        year: "numeric"
                                                                    }
                                                                )
                                                            }

                                                        </span>


                                                        <h3>
                                                            {
                                                                resolveLocalizedText(update.project_update_translations,language,"title",update.title) ?? update.title
                                                            }
                                                        </h3>


                                                        {
                                                            resolveLocalizedText(update.project_update_translations,language,"description",update.description) && (

                                                                <p>
                                                                    {
                                                                        resolveLocalizedText(update.project_update_translations,language,"description",update.description)
                                                                    }
                                                                </p>

                                                            )
                                                        }

                                                    </article>

                                                )

                                            )

                                        )
                                    }

                                </div>

                            </div>

                        </>

                    )}

            </div>

        </div>,

        document.body

    );

}