"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { donations } from "@/data/donations";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type DonationOrigin =
    | {
        type: "thematic";
        donationType: keyof typeof donations;
    }
    | {
        type: "project";
        projectId: string;
        projectName: string;
    }
    | {
        type: "free";
    }
    | {
        type: "cart";
    };

export function useCollaborate() {

    const { t } = useLanguage();
    const [selectedDonation, setSelectedDonation] =
        useState<keyof typeof donations | null>(null);
    const { user } = useAuth();
    const [amount, setAmount] = useState(25);

    const [isMonthly, setIsMonthly] = useState(true);

    const [showHelpPanel, setShowHelpPanel] =
        useState(false);

    const [confirmedAmounts, setConfirmedAmounts] = useState({
        food: donations.food.defaultAmount,
        hygiene: donations.hygiene.defaultAmount,
        health: donations.health.defaultAmount,
    });

    const [donationOrigin, setDonationOrigin] =
        useState<DonationOrigin | null>(null);

    function closeDonation() {

        setSelectedDonation(null);

        setDonationOrigin(null);

    }

    function updateConfirmedAmount(
        type: keyof typeof donations,
        value: number
    ) {

        setConfirmedAmounts(prev => ({

            ...prev,

            [type]: value

        }));

    }

    function openThematicDonation(
        type: keyof typeof donations,
        value: number
    ) {

        setSelectedDonation(type);

        setAmount(value);

        setDonationOrigin({

            type: "thematic",

            donationType: type

        });

    }

    function openProjectDonation(
        projectId: string,
        projectName: string
    ) {

        setSelectedDonation(null);

        setDonationOrigin({

            type: "project",

            projectId,

            projectName

        });

        setAmount(25);

    }

    function openFreeDonation() {

        setSelectedDonation(null);

        setDonationOrigin({

            type: "free"

        });

        setAmount(25);

    }

    const currentDonation =
        selectedDonation
            ? donations[selectedDonation]
            : null;

    const calculatedUnits =
        currentDonation
            ? Math.floor(
                amount /
                currentDonation.price *
                currentDonation.units
            )
            : 0;

    const cartItems = Object.entries(confirmedAmounts)
        .map(([type, amount]) => {
            const donation =
                donations[type as keyof typeof donations];

            const numericAmount = Number(amount);

            return {
                type: type as keyof typeof donations,
                amount: numericAmount,
                quantity: Math.floor(
                    numericAmount / donation.price
                ),
                unitPrice: donation.price,
                icon: donation.icon,
                color: donation.color,
            };
        })
        .filter(item => item.amount > 0);

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.amount,
        0
    );

    return {
        selectedDonation,
        setSelectedDonation,
        cartItems,
        cartTotal,
        amount,
        setAmount,
        isMonthly,
        setIsMonthly,
        showHelpPanel,
        setShowHelpPanel,
        confirmedAmounts,
        updateConfirmedAmount,
        closeDonation,
        currentDonation,
        calculatedUnits,
        donationOrigin,
        openThematicDonation,
        openProjectDonation,
        openFreeDonation,
        continueDonation,
    };
    
    async function continueDonation() {
        if (!donationOrigin) return;

        try {
            const { data, error: sessionError } =
                await supabase.auth.getSession();

            const token = data?.session?.access_token;

            if (sessionError || (user && !token)) {
                alert(
                    t.collaborate_session_error
                );
                return;
            }

            const payload = {
                origin: donationOrigin,
                amount,
                isMonthly,
                currency: "EUR",
            };

            const res = await fetch(
                "/api/stripe/checkout",
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        ...(token
                            ? {
                                authorization:
                                    `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify(payload),
                }
            );

            const json = await res.json();

            console.info("[checkout response]", {
                status: res.status,
                statusText: res.statusText,
                contentType:
                    res.headers.get("content-type"),
                hasSession: Boolean(data?.session),
                hasAccessToken: Boolean(token),
                hasAuthorizationHeader:
                    Boolean(token),
                json,
            });

            if (json?.url) {
                window.location.href = json.url;
                return;
            }

            console.error(
                "Checkout creation failed",
                json
            );

            alert(
                t.collaborate_payment_error
            );
        } catch (error) {
            console.error(error);
            alert(t.collaborate_payment_start_error);
        }
    }

}
