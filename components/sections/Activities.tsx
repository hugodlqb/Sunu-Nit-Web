"use client";

import "@/styles/activities.css";

import ProjectDonationCards from "@/components/ui/Collaborate/ProjectDonationCards";
import Section from "@/components/ui/Section";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";
import ProjectModal from "@/components/ui/ProjectModal";

import { useState } from "react";

interface Props {
    onDonate: (
        projectId: string,
        projectName: string
    ) => void;
}

export default function Activities({ onDonate }: Props) {
    const [selectedProjectId, setSelectedProjectId] =
        useState<string | null>(null);

    useLockBodyScroll(!!selectedProjectId);

    return (
        <Section
            id="activities"
            variant="white"
        >
            <div className="container">

                <div className="projects-main-section">

                    <div className="section-header">

                        <h2>
                            Proyectos
                        </h2>

                        <p className="section-subtitle">
                            Conoce los proyectos que estamos impulsando.
                        </p>

                    </div>

                    <ProjectDonationCards
                        onDonate={onDonate}
                        onDetails={(projectId) =>
                            setSelectedProjectId(projectId)
                        }
                    />

                </div>

            </div>

            {selectedProjectId && (
                <ProjectModal
                    projectId={selectedProjectId}
                    onClose={() =>
                        setSelectedProjectId(null)
                    }
                    onDonate={(projectId, projectName) => {
                        setSelectedProjectId(null);
                        onDonate(projectId, projectName);
                    }}
                />
            )}

        </Section>
    );
}
