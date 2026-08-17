"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

interface DonationProject {
    id: string;
    amount: number;
    projects: {
        id: string;
        key: string;
        name: string;
    } | null;
}

interface DonationItem {
    id: string;
    amount: number;
    quantity: number | null;
    donation_types: {
        id: string;
        key: string;
        name: string;
    } | null;
}

interface Donation {
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    created_at: string;
    completed_at: string | null;
    donation_projects: DonationProject[];
    donation_items: DonationItem[];
}

export default function AccountDonations() {
    const { profile } = useAuth();
    const { t } = useLanguage();
    const [donations, setDonations] = useState<Donation[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            if (!profile?.id) return;
            setLoading(true);

            const { data, error } = await supabase
                .from("donations")
                .select(`
                    id,
                    amount,
                    currency,
                    payment_method,
                    status,
                    created_at,
                    completed_at,
                    donation_projects (
                        id,
                        amount,
                        projects (
                            id,
                            key,
                            name
                        )
                    ),
                    donation_items (
                        id,
                        amount,
                        quantity,
                        donation_types (
                            id,
                            key,
                            name
                        )
                    )
                `)
                .eq("person_id", profile.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("ERROR DONACIONES");
                console.error("message:", error.message);
                console.error("details:", error.details);
                console.error("hint:", error.hint);
                console.error("code:", error.code);

                setDonations([]);

            } else {
                console.log(
                    "DONACIONES RAW JSON:",
                    JSON.stringify(data, null, 2)
                );

                const normalized: Donation[] = (data ?? []).map((d: any) => ({
                    id: d.id,
                    amount: Number(d.amount),
                    currency: d.currency,
                    payment_method: d.payment_method,
                    status: d.status,
                    created_at: d.created_at,
                    completed_at: d.completed_at,

                    donation_projects: (d.donation_projects ?? []).map((p: any) => ({
                        id: p.id,
                        amount: Number(p.amount),
                        projects: Array.isArray(p.projects)
                            ? p.projects[0] ?? null
                            : p.projects ?? null,
                    })),

                    donation_items: (d.donation_items ?? []).map((i: any) => ({
                        id: i.id,
                        amount: Number(i.amount),
                        quantity:
                            i.quantity !== null
                                ? Number(i.quantity)
                                : null,
                        donation_types: Array.isArray(i.donation_types)
                            ? i.donation_types[0] ?? null
                            : i.donation_types ?? null,
                    })),
                }));

                setDonations(normalized);
            }

            setLoading(false);
        }

        load();
    }, [profile?.id]);

    if (!profile) {
        return <div>{t.login_no_account}</div>;
    }

    return (
        <div>
            <h2>{t.user_donations}</h2>

            {loading && <p>{t.reset_password_loading}</p>}

            {!loading && donations && donations.length === 0 && (
                <p>{t.no_donations}</p>
            )}

            <ul className="account-donations-list">
                {donations?.map((d) => (
                    <li
                        key={d.id}
                        className="account-donation-item"
                    >
                        <div>
                            <strong>
                                {d.amount} {d.currency}
                            </strong>
                        </div>

                        <div>
                            {d.donation_projects?.length > 0 ? (
                                d.donation_projects.map((project) => (
                                    <div key={project.id}>
                                        Proyecto:{" "}
                                        {project.projects?.name ?? "General"}
                                        {" · "}
                                        {project.amount} {d.currency}
                                    </div>
                                ))
                            ) : (
                                <div>
                                    General
                                </div>
                            )}
                        </div>

                        {d.donation_items?.length > 0 && (
                            <div>
                                {d.donation_items.map((item) => (
                                    <div key={item.id}>
                                        {item.donation_types?.name ?? "Donación"}
                                        {" × "}
                                        {item.quantity ?? 1}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            {new Date(d.created_at).toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}