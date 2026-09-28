"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

interface DonationProject {
    id: string;
    amount: number;
    project_id: string;
    projects: {
        id: string;
        name: string;
        target_amount: number;
        current_amount: number;
        currency: string;
    } | null;
}

interface Donation {
    id: string;
    status: string;
    donation_projects: DonationProject[];
}

interface ProjectStatistic {
    id: string;
    name: string;
    donated: number;
    target: number;
    current: number;
    currency: string;
}

export default function AccountProjects() {
    const { profile } = useAuth();
    const { t } = useLanguage();

    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!profile?.id) return;

            setLoading(true);

            const { data, error } = await supabase
                .from("donations")
                .select(`
                    id,
                    status,
                    donation_projects (
                        id,
                        amount,
                        project_id,
                        projects (
                            id,
                            name,
                            target_amount,
                            current_amount,
                            currency
                        )
                    )
                `)
                .eq("person_id", profile.id)
                .order("created_at", {
                    ascending: false,
                });

            if (error) {
                console.error(
                    "ERROR PROYECTOS:",
                    error
                );
                setDonations([]);
                setLoading(false);
                return;
            }

            const normalized: Donation[] =
                (data ?? []).map((d: any) => ({
                    id: d.id,
                    status: d.status,
                    donation_projects:
                        (d.donation_projects ?? []).map(
                            (p: any) => ({
                                id: p.id,
                                amount: Number(p.amount),
                                project_id: p.project_id,
                                projects:
                                    Array.isArray(p.projects)
                                        ? p.projects[0] ?? null
                                        : p.projects ?? null,
                            })
                        ),
                }));

            setDonations(normalized);
            setLoading(false);
        }

        load();
    }, [profile?.id]);

    const projectStatistics = useMemo(() => {
        const projects: Record<string, ProjectStatistic> = {};

        donations
            .filter(
                (donation) =>
                    donation.status === "completed"
            )
            .forEach((donation) => {
                donation.donation_projects?.forEach(
                    (donationProject) => {
                        const project =
                            donationProject.projects;

                        if (!project) return;

                        if (!projects[project.id]) {
                            projects[project.id] = {
                                id: project.id,
                                name: project.name,
                                donated: 0,
                                target: Number(
                                    project.target_amount
                                ),
                                current: Number(
                                    project.current_amount
                                ),
                                currency:
                                    project.currency ?? "EUR",
                            };
                        }

                        projects[project.id].donated +=
                            Number(donationProject.amount);
                    }
                );
            });

        return Object.values(projects);
    }, [donations]);

    if (!profile) {
        return null;
    }

    return (
        <div className="account-projects">

            <div className="account-profile-header">
                <h2>{t.user_projects}</h2>
            </div>

            {loading ? (
                <p>
                    {t.reset_password_loading}
                </p>
            ) : projectStatistics.length === 0 ? (
                <p>
                    {t.no_donations}
                </p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginTop: "20px",
                        maxHeight: "430px",
                        overflowY: "auto",
                        paddingRight: "8px",
                    }}
                >
                    {projectStatistics.map((project) => {
                        const progress =
                            project.target > 0
                                ? Math.min(
                                    100,
                                    (project.current /
                                        project.target) *
                                    100
                                )
                                : 0;

                        return (

                            <div
                                key={project.id}
                                style={{
                                    padding: "12px",
                                    border: "1px solid #ddd",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                    }}
                                >
                                    <strong>
                                        {project.name}
                                    </strong>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{
                                            flexShrink: 0,
                                        }}
                                    >
                                        {t.project_donate}
                                    </button>
                                </div>

                                <p
                                    style={{
                                        margin: "6px 0",
                                    }}
                                >
                                    Has donado:{" "}
                                    <strong>
                                        {project.donated.toFixed(2)}{" "}
                                        {project.currency}
                                    </strong>
                                </p>

                                <p
                                    style={{
                                        margin: "6px 0",
                                        fontSize: "14px",
                                    }}
                                >
                                    Objetivo:{" "}
                                    {project.current.toFixed(2)} /{" "}
                                    {project.target.toFixed(2)}{" "}
                                    {project.currency}
                                </p>

                                <div
                                    style={{
                                        marginTop: "10px",
                                        height: "8px",
                                        background: "#e5e5e5",
                                        borderRadius: "999px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${progress}%`,
                                            height: "100%",
                                            background: "#4CAF50",
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        marginTop: "6px",
                                        fontSize: "12px",
                                        textAlign: "right",
                                    }}
                                >
                                    {progress.toFixed(0)}%
                                </div>

                                <div
                                    style={{
                                        marginTop: "12px",
                                    }}
                                >
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}