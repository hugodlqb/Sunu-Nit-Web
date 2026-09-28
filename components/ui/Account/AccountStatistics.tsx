"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface DonationItem {
    id: string;
    amount: number;
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
    status: string;
    donation_items: DonationItem[];
}

export default function AccountProfile() {
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
                    amount,
                    currency,
                    status,
                    donation_items (
                        id,
                        amount,
                        donation_types (
                            id,
                            key,
                            name
                        )
                    )
                `)
                .eq("person_id", profile.id)
                .order("created_at", {
                    ascending: false,
                });

            if (error) {
                console.error(
                    "ERROR ESTADISTICAS:",
                    error
                );
                setDonations([]);
                setLoading(false);
                return;
            }

            const normalized: Donation[] =
                (data ?? []).map((d: any) => ({
                    id: d.id,
                    amount: Number(d.amount),
                    currency: d.currency,
                    status: d.status,

                    donation_items:
                        (d.donation_items ?? []).map(
                            (item: any) => ({
                                id: item.id,
                                amount: Number(item.amount),
                                donation_types:
                                    Array.isArray(
                                        item.donation_types
                                    )
                                        ? item.donation_types[0] ??
                                          null
                                        : item.donation_types ??
                                          null,
                            })
                        ),
                }));

            setDonations(normalized);
            setLoading(false);
        }

        load();
    }, [profile?.id]);

    const completedDonations = useMemo(
        () =>
            donations.filter(
                (donation) =>
                    donation.status === "completed"
            ),
        [donations]
    );

    const totalDonated = useMemo(
        () =>
            completedDonations.reduce(
                (total, donation) =>
                    total + donation.amount,
                0
            ),
        [completedDonations]
    );

    const donationTypeChartData = useMemo(() => {
        const totals: Record<string, number> = {};

        completedDonations.forEach((donation) => {
            donation.donation_items?.forEach(
                (item) => {
                    const name =
                        item.donation_types?.name ??
                        "Donación";

                    totals[name] =
                        (totals[name] ?? 0) +
                        item.amount;
                }
            );
        });

        return Object.entries(totals).map(
            ([name, value]) => ({
                name,
                value,
            })
        );
    }, [completedDonations]);

    if (!profile) {
        return null;
    }

    return (
        <div className="account-statistics">
            <div className="account-profile-header">
                <h2>{t.user_statistics}</h2>
            </div>

            {loading ? (
                <p>{t.reset_password_loading}</p>
            ) : (
                <>
                    <p>
                        <strong>Donaciones:</strong>{" "}
                        {completedDonations.length}
                    </p>

                    <p>
                        <strong>Total donado:</strong>{" "}
                        {totalDonated.toFixed(2)} €
                    </p>

                    {donationTypeChartData.length > 0 && (
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "500px",
                                height: "320px",
                                marginTop: "20px",
                            }}
                        >
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={donationTypeChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="70%"
                                        label
                                    >
                                        {donationTypeChartData.map(
                                            (_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={[
                                                        "#4CAF50",
                                                        "#2196F3",
                                                        "#FF9800",
                                                        "#9C27B0",
                                                        "#F44336",
                                                    ][index % 5]}
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value) =>
                                            `${value} €`
                                        }
                                    />

                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {completedDonations.length === 0 && (
                        <p>{t.no_donations}</p>
                    )}
                </>
            )}
        </div>
    );
}