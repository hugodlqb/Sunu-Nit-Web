"use client";

import ProjectCard from "@/components/ui/ProjectCard";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  id: string;
  name: string;
  description: string;
  image: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  onDonate?: (projectId: string) => void;
}

export default function ProjectDonationCard({
  id,
  name,
  description,
  image,
  targetAmount,
  currentAmount,
  currency,
  onDonate,
}: Props) {

  const { t } = useLanguage();

  return (
    <ProjectCard
      id={id}
      name={name}
      description={description}
      image={image}
      targetAmount={targetAmount}
      currentAmount={currentAmount}
      currency={currency}
      actionLabel={t.project_donate}
      onAction={onDonate}
    />
  );
}