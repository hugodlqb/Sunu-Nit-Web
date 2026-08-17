"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProjectDonationCard from "./ProjectDonationCard";
import { useLanguage } from "@/context/LanguageContext";

interface Project {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    target_amount: number;
    current_amount: number;
    currency: string;
}

interface Props {
    onDonate: (projectId: string) => void;
}

export default function ProjectDonationCards({
    onDonate
}: Props) {

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadProjects() {

            const { data, error } = await supabase
                .from("projects")
                .select(`
                    id,
                    name,
                    description,
                    image,
                    target_amount,
                    current_amount,
                    currency
                `)
                .eq("active", true)
                .eq("status", "active")
                .order("created_at", {
                    ascending: false
                });

            if (error) {

                console.error(
                    "Error cargando proyectos:",
                    error
                );

                setProjects([]);

            } else {

                setProjects(data ?? []);

            }

            setLoading(false);
        }

        loadProjects();

    }, []);

    const { t } = useLanguage();

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

            <div className="project-donation-header">

                <h3>
                    Apoya un proyecto
                </h3>

                <p>
                    Elige un proyecto y decide cuánto quieres aportar.
                </p>

            </div>


            <div className="project-donation-grid">

                {projects.map(project => (

                    <ProjectDonationCard

                        key={project.id}

                        id={project.id}

                        name={project.name}

                        description={
                            project.description ?? ""
                        }

                        image={project.image}

                        targetAmount={
                            Number(project.target_amount)
                        }

                        currentAmount={
                            Number(project.current_amount)
                        }

                        currency={
                            project.currency
                        }

                        onDonate={onDonate}

                    />

                ))}

            </div>

        </div>

    );
}