"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    CheckCircle,
    WarningCircle
} from "@phosphor-icons/react/dist/ssr";

type DonationStatus =
    | "pending"
    | "completed"
    | "failed"
    | "refunded"
    | string;

export default function SuccessPage() {
    const { t } = useLanguage();
    const [donationId, setDonationId] =
        useState<string | null>(null);

    const [status, setStatus] =
        useState<DonationStatus | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("donation_id");

        if (!id) {
            setError(
                t.donation_not_found
            );
            return;
        }

        setDonationId(id);
    }, []);

    useEffect(() => {
        if (!donationId) {
            return;
        }

        let cancelled = false;
        let attempts = 0;

        const maxAttempts = 15;
        const intervalMs = 1000;

        async function checkDonation() {
            try {
                const response = await fetch(
                    `/api/donation-status?donation_id=${encodeURIComponent(
                        donationId
                    )}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        t.donation_status_check_error
                    );
                }

                const data =
                    await response.json();

                if (cancelled) {
                    return;
                }

                setStatus(data.status);

                if (
                    data.status === "completed" ||
                    data.status === "failed" ||
                    data.status === "refunded"
                ) {
                    return;
                }

                attempts++;

                if (attempts >= maxAttempts) {
                    setError(
                        t.donation_confirmation_delayed
                    );
                    return;
                }

                setTimeout(
                    checkDonation,
                    intervalMs
                );

            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(err);

                attempts++;

                if (attempts >= maxAttempts) {
                    setError(
                        t.donation_status_unavailable
                    );
                    return;
                }

                setTimeout(
                    checkDonation,
                    intervalMs
                );
            }
        }

        checkDonation();

        return () => {
            cancelled = true;
        };

    }, [donationId]);

    if (error) {
        return (
            <div className="container section donation-success-page">
                <div className="donation-success-card">

                    <WarningCircle
                        size={64}
                        weight="fill"
                    />

                    <h1>
                        {t.donation_success_problem_title}
                    </h1>

                    <p>{error}</p>

                    <p>
                        {t.donation_success_no_repay}
                    </p>

                </div>
            </div>
        );
    }

    if (status === "completed") {
        return (
            <div className="container section donation-success-page">
                <div className="donation-success-card">

                    <CheckCircle
                        size={72}
                        weight="fill"
                    />

                    <h1>
                        {t.donation_success_thanks_title}
                    </h1>

                    <p>
                        {t.donation_success_completed}
                    </p>

                    <p>
                        {t.donation_success_impact}
                    </p>

                </div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="container section donation-success-page">
                <div className="donation-success-card">

                    <WarningCircle
                        size={64}
                        weight="fill"
                    />

                    <h1>
                        {t.donation_success_failed_title}
                    </h1>

                    <p>
                        {t.donation_success_failed}
                    </p>

                </div>
            </div>
        );
    }

    if (status === "refunded") {
        return (
            <div className="container section donation-success-page">
                <div className="donation-success-card">

                    <WarningCircle
                        size={64}
                        weight="fill"
                    />

                    <h1>
                        {t.donation_success_refunded_title}
                    </h1>

                    <p>
                        {t.donation_success_refunded}
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="container section donation-success-page">
            <div className="donation-success-card">

                <div className="donation-success-spinner" />

                <h1>{t.donation_success_pending_title}</h1>

                <p>
                    {t.donation_success_pending}
                </p>

                <p className="donation-success-small">
                    {t.donation_success_pending_note}
                </p>

            </div>
        </div>
    );
}