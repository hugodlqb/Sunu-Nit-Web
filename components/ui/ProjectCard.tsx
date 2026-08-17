"use client";

import React from "react";
import { FolderOpen } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  id: string;
  name: string;
  description: string;
  image: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  actionLabel?: string;
  onAction?: (projectId: string) => void;
}

export default function ProjectCard({
  id,
  name,
  description,
  image,
  targetAmount,
  currentAmount,
  currency,
  actionLabel,
  onAction,
}: Props) {
  const progress =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const { t } = useLanguage();

  return (
    <article className="project-card project-donation-card">
      <div className="project-donation-image project-card-image">
        {image ? <img src={image} alt={name} /> : <FolderOpen size={48} />}
      </div>

      <div className="project-donation-content project-card-content">
        <h4>{name}</h4>
        <p>{description}</p>

        <div className="project-donation-progress project-card-progress">
          <div className="project-donation-progress-bar project-card-progress-bar">
            <div
              className="project-donation-progress-fill project-card-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="project-donation-progress-info project-card-progress-info">
            <span>
              {currentAmount.toLocaleString("es-ES")} {currency}
            </span>
            <span>
              {targetAmount.toLocaleString("es-ES")} {currency}
            </span>
          </div>
        </div>

        {onAction && (
          <div className="project-card-actions project-donation-actions">
            <button
              className="btn btn-primary"
              onClick={() => onAction(id)}
            >
              {actionLabel ?? t.project_collaborate}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
