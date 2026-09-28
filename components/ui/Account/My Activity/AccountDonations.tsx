"use client";

import { useEffect, useMemo, useState } from "react";
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

interface DonationPayment {
    id: string;
    amount: number;
    currency: string;
    stripe_payment_intent_id: string | null;
    stripe_invoice_id: string | null;
    stripe_charge_id: string | null;
    status: string;
    paid_at: string | null;
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
    donation_payments: DonationPayment[];
}

export default function AccountDonations() {
    const { profile } = useAuth();
    const { t } = useLanguage();

    const [donations, setDonations] = useState<Donation[] | null>(null);
    const [loading, setLoading] = useState(false);

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [receiptLoading, setReceiptLoading] = useState<string | null>(null);

    /*
     * ---------------------------------------------------------
     * LOAD DONATIONS
     * ---------------------------------------------------------
     */

    useEffect(() => {
        async function load() {
            if (!profile?.id) return;

            setLoading(true);

            const { data, error } = await supabase
                .from("donations")
                .select(`
                    id,
                    person_id,
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
                    ),

                    donation_payments (
                        id,
                        amount,
                        currency,
                        stripe_payment_intent_id,
                        stripe_invoice_id,
                        stripe_charge_id,
                        status,
                        paid_at
                    )
                `)
                .eq("person_id", profile.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("ERROR DONACIONES:", error);
                setDonations([]);
                setLoading(false);
                return;
            }

            const normalized: Donation[] = (data ?? []).map((d: any) => ({
                id: d.id,
                amount: Number(d.amount),
                currency: d.currency,
                payment_method: d.payment_method,
                status: d.status,
                created_at: d.created_at,
                completed_at: d.completed_at,

                donation_projects: (d.donation_projects ?? []).map(
                    (p: any) => ({
                        id: p.id,
                        amount: Number(p.amount),
                        projects: Array.isArray(p.projects)
                            ? p.projects[0] ?? null
                            : p.projects ?? null,
                    })
                ),

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

                donation_payments: (d.donation_payments ?? []).map(
                    (p: any) => ({
                        id: p.id,
                        amount: Number(p.amount),
                        currency: p.currency,
                        stripe_payment_intent_id:
                            p.stripe_payment_intent_id,
                        stripe_invoice_id:
                            p.stripe_invoice_id,
                        stripe_charge_id:
                            p.stripe_charge_id,
                        status: p.status,
                        paid_at: p.paid_at,
                    })
                ),
            }));

            setDonations(normalized);
            setLoading(false);
        }

        load();
    }, [profile?.id]);

    /*
     * ---------------------------------------------------------
     * FILTER
     * ---------------------------------------------------------
     */

    const filteredDonations = useMemo(() => {
        if (!donations) return [];

        return donations.filter((donation) => {
            const donationDate = new Date(donation.created_at);

            if (dateFrom) {
                const from = new Date(`${dateFrom}T00:00:00`);

                if (donationDate < from) {
                    return false;
                }
            }

            if (dateTo) {
                const to = new Date(`${dateTo}T23:59:59.999`);

                if (donationDate > to) {
                    return false;
                }
            }

            return true;
        });
    }, [donations, dateFrom, dateTo]);

    /*
     * ---------------------------------------------------------
     * RECEIPT
     * ---------------------------------------------------------
     */

    async function openReceipt(paymentId: string) {
        if (receiptLoading) return;

        const receiptWindow = window.open(
            "",
            "_blank"
        );

        setReceiptLoading(paymentId);

        try {
            const { data } =
                await supabase.auth.getSession();

            const token =
                data?.session?.access_token;

            const response = await fetch(
                `/api/donations/receipt?payment_id=${encodeURIComponent(
                    paymentId
                )}`,
                {
                    headers: {
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );

            const json = await response.json();

            if (!response.ok || !json?.url) {
                receiptWindow?.close();

                alert(
                    json?.error ??
                    "No se pudo obtener el justificante."
                );

                return;
            }

            if (receiptWindow) {
                receiptWindow.location.href =
                    json.url;
            } else {
                window.location.href =
                    json.url;
            }
        } catch (error) {
            receiptWindow?.close();

            console.error(
                "Error obteniendo justificante:",
                error
            );

            alert(
                "No se pudo obtener el justificante."
            );
        } finally {
            setReceiptLoading(null);
        }
    }

    /*
     * ---------------------------------------------------------
     * HELPERS
     * ---------------------------------------------------------
     */

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(
            "es-ES",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    }

    function getDonationDestination(
        donation: Donation
    ) {
        const result: string[] = [];

        donation.donation_items?.forEach(
            (item) => {
                result.push(
                    `${item.donation_types?.name ?? "Donación"} ${item.amount} ${donation.currency}`
                );
            }
        );

        donation.donation_projects?.forEach(
            (project) => {
                result.push(
                    `${project.projects?.name ?? "Proyecto"} ${project.amount} ${donation.currency}`
                );
            }
        );

        if (result.length === 0) {
            return "General";
        }

        return result.join(" · ");
    }

    function getStatusLabel(status: string) {
        switch (status) {
            case "completed":
                return "Completada";

            case "pending":
                return "Pendiente";

            case "failed":
                return "Fallida";

            case "refunded":
                return "Reembolsada";

            default:
                return status;
        }
    }

    function clearFilters() {
        setDateFrom("");
        setDateTo("");
    }

    if (!profile) {
        return <div>{t.login_no_account}</div>;
    }

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    return (
        <div>
            <h2>{t.user_donations}</h2>

            {/* FILTROS */}

            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "end",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <label
                        htmlFor="donations-date-from"
                        style={{
                            display: "block",
                            marginBottom: "4px",
                        }}
                    >
                        Desde
                    </label>

                    <input
                        className="account-date-input"
                        type="date"
                        value={dateFrom}
                        onChange={e =>
                            setDateFrom(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label
                        htmlFor="donations-date-to"
                        style={{
                            display: "block",
                            marginBottom: "4px",
                        }}
                    >
                        Hasta
                    </label>

                    <input
                        className="account-date-input"
                        type="date"
                        value={dateTo}
                        onChange={e =>
                            setDateTo(e.target.value)
                        }
                    />
                </div>

                {(dateFrom || dateTo) && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="btn btn-outline"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* TABLA */}

            {loading && (
                <p>{t.reset_password_loading}</p>
            )}

            {!loading &&
                filteredDonations.length === 0 && (
                    <p>
                        {t.no_donations}
                    </p>
                )}

            {!loading &&
                filteredDonations.length > 0 && (
                    <div
                        style={{
                            width: "100%",
                            overflowX: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse:
                                    "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "10px",
                                        }}
                                    >
                                        Fecha
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "10px",
                                        }}
                                    >
                                        Importe
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "10px",
                                        }}
                                    >
                                        Destino
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "10px",
                                        }}
                                    >
                                        Estado
                                    </th>

                                    <th
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "10px",
                                        }}
                                    >
                                        Justificante
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDonations.map(
                                    (donation) => {
                                        const successfulPayments =
                                            donation.donation_payments?.filter(
                                                (payment) =>
                                                    payment.status ===
                                                    "succeeded"
                                            ) ?? [];

                                        return (
                                            <tr
                                                key={
                                                    donation.id
                                                }
                                                style={{
                                                    borderTop:
                                                        "1px solid #ddd",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding:
                                                            "10px",
                                                    }}
                                                >
                                                    {formatDate(
                                                        donation.created_at
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "10px",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    <strong>
                                                        {
                                                            donation.amount
                                                        }{" "}
                                                        {
                                                            donation.currency
                                                        }
                                                    </strong>
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "10px",
                                                    }}
                                                >
                                                    {getDonationDestination(
                                                        donation
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "10px",
                                                    }}
                                                >
                                                    {getStatusLabel(
                                                        donation.status
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "10px",
                                                    }}
                                                >
                                                    {successfulPayments.length ===
                                                        0 ? (
                                                        <span>
                                                            —
                                                        </span>
                                                    ) : successfulPayments.length ===
                                                        1 ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline"
                                                            disabled={
                                                                receiptLoading ===
                                                                successfulPayments[0]
                                                                    .id
                                                            }
                                                            onClick={() =>
                                                                openReceipt(
                                                                    successfulPayments[0]
                                                                        .id
                                                                )
                                                            }
                                                        >
                                                            {receiptLoading ===
                                                                successfulPayments[0]
                                                                    .id
                                                                ? "Abriendo..."
                                                                : "Ver justificante"}
                                                        </button>
                                                    ) : (
                                                        <details>
                                                            <summary
                                                                style={{
                                                                    cursor:
                                                                        "pointer",
                                                                }}
                                                            >
                                                                Ver justificantes (
                                                                {
                                                                    successfulPayments.length
                                                                }
                                                                )
                                                            </summary>

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "8px",
                                                                    display:
                                                                        "flex",
                                                                    flexDirection:
                                                                        "column",
                                                                    gap:
                                                                        "6px",
                                                                }}
                                                            >
                                                                {successfulPayments.map(
                                                                    (
                                                                        payment,
                                                                        index
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                payment.id
                                                                            }
                                                                            type="button"
                                                                            className="btn btn-outline"
                                                                            disabled={
                                                                                receiptLoading ===
                                                                                payment.id
                                                                            }
                                                                            onClick={() =>
                                                                                openReceipt(
                                                                                    payment.id
                                                                                )
                                                                            }
                                                                        >
                                                                            {receiptLoading ===
                                                                                payment.id
                                                                                ? "Abriendo..."
                                                                                : `Pago ${index +
                                                                                1
                                                                                } · ${payment.amount} ${payment.currency}`}
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </details>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
        </div>
    );
}