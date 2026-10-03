"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProjectMainCard from "@/components/ui/ProjectMainCard";
import { useLanguage } from "@/context/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface Project {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    target_amount: number;
    current_amount: number;
    currency: string;
    show_in_projects: boolean;
}

interface Props {
    onDonate?: (
        projectId: string,
        projectName: string
    ) => void;
    onDetails?: (projectId: string) => void;
}

export default function ProjectDonationCards({
    onDonate,
    onDetails,
}: Props) {

    const [projects, setProjects] =
        useState<Project[]>([]);

    const [loading, setLoading] =
        useState(true);

    const { t } =
        useLanguage();

    useEffect(() => {

        async function loadProjects() {

            setLoading(true);

            const {
                data,
                error,
            } = await supabase
                .from("projects")
                .select(
                    `
                    id,
                    name,
                    description,
                    image,
                    target_amount,
                    current_amount,
                    currency,
                    show_in_projects
                `
                )
                .eq("active", true)
                .eq("status", "active")
                .eq("show_in_projects", true)
                .order("created_at", {
                    ascending: false,
                });

            if (error) {

                console.error(
                    "========== ERROR PROJECTS =========="
                );

                console.error(
                    "message:",
                    error.message
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
                    "code:",
                    error.code
                );

                console.error(
                    "error completo:",
                    JSON.stringify(
                        error,
                        Object.getOwnPropertyNames(error),
                        2
                    )
                );

                console.error(
                    "===================================="
                );

                setProjects([]);
                setLoading(false);

                return;
            }

            setProjects(
                data ?? []
            );

            setLoading(false);
        }

        loadProjects();

    }, []);

    if (loading) {

        return (
            <div className="projects-loading">
                {t.projects_loading}
            </div>
        );
    }

    if (projects.length === 0) {
        return null;
    }

    return (
        <div className="project-donation-section">
            <Swiper
                className="projects-swiper"
                modules={[Navigation]}
                navigation
                loop={true}
                spaceBetween={24}
                slidesPerView={3}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                    },
                    768: {
                        slidesPerView: 2,
                    },
                    1100: {
                        slidesPerView: 3,
                    },
                }}
            >
                {projects.map((project) => (
                    <SwiperSlide key={project.id}>
                        <ProjectMainCard
                            id={project.id}
                            name={project.name}
                            image={project.image}
                            onDetails={onDetails}
                            onDonate={onDonate}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
