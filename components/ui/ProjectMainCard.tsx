"use client";

import { CaretRight } from "@phosphor-icons/react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
    id: string;
    name: string;
    image: string | null;
    onDetails?: (projectId: string) => void;
    onDonate?: (
        projectId: string,
        projectName: string
    ) => void;
}

export default function ProjectMainCard({
    id,
    name,
    image,
    onDetails,
    onDonate,
}: Props) {
    const { t } = useLanguage();

    const handleDetails = () => {
        onDetails?.(id);
    };

    return (
        <article
            className="activity-card project-main-card"
            onClick={handleDetails}
        >
            <div className="activity-image">
                {image && (
                    <img
                        src={image}
                        alt={name}
                    />
                )}
            </div>

            <div className="activity-info project-main-info">
                <h3>
                    {name}
                </h3>

                <div className="project-main-actions">
                    <button
                        type="button"
                        className="activity-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDetails();
                        }}
                    >
                        <span>
                            {t.btn_saber_mas}
                        </span>

                        <CaretRight
                            size={18}
                            weight="bold"
                        />
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary project-main-donate-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDonate?.(id, name);
                        }}
                    >
                        {t.project_donate}
                    </button>
                </div>
            </div>
        </article>
    );
}