"use client";

import ProjectCard from "@/components/ui/ProjectCard";

interface Props {
  id: string;
  name: string;
  description: string;
  image: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  onDonate: (projectId: string) => void;
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
  return (
    <ProjectCard
      id={id}
      name={name}
      description={description}
      image={image}
      targetAmount={targetAmount}
      currentAmount={currentAmount}
      currency={currency}
      actionLabel="Donar a este proyecto"
      onAction={onDonate}
    />
  );
}