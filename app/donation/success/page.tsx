"use client";

import { useEffect, useState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

type DonationStatus =
    | "pending"
    | "completed"
    | "failed"
    | "refunded"
    | string;

export default function SuccessPage() {
    const [donationId, setDonationId] = useState<string | null>(null);
    const [status, setStatus] = useState<DonationStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("donation_id");

        if (!id) {
            setError("No se ha encontrado la donación.");
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
                        "No se pudo consultar el estado de la donación."
                    );
                }

                const data = await response.json();

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
                        "La confirmación está tardando más de lo esperado."
                    );

                    return;
                }

                setTimeout(checkDonation, intervalMs);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(err);

                attempts++;

                if (attempts >= maxAttempts) {
                    setError(
                        "No hemos podido comprobar el estado de la donación."
                    );

                    return;
                }

                setTimeout(checkDonation, intervalMs);
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
                        Estamos teniendo un problema
                    </h1>

                    <p>
                        {error}
                    </p>

                    <p>
                        Si el pago se ha realizado correctamente,
                        no es necesario volver a pagar.
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
                        ¡Gracias por tu donación!
                    </h1>

                    <p>
                        Tu donación se ha realizado correctamente.
                    </p>

                    <p>
                        Gracias por ayudar a hacer posible nuestro trabajo.
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
                        No hemos podido completar la donación
                    </h1>

                    <p>
                        El pago no se ha podido completar correctamente.
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
                        Donación reembolsada
                    </h1>

                    <p>
                        Esta donación ha sido reembolsada.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container section donation-success-page">
            <div className="donation-success-card">
                <div className="donation-success-spinner" />

                <h1>
                    Gracias
                </h1>

                <p>
                    Estamos confirmando tu donación...
                </p>

                <p className="donation-success-small">
                    Esto puede tardar unos segundos.
                </p>
            </div>
        </div>
    );
}