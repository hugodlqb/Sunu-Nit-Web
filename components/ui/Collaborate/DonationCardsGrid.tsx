"use client";

import { donations } from "@/data/donations";
import DonationCard from "@/components/ui/Collaborate/DonationCard";

interface Props {

    confirmedAmounts: {
        food: number;
        hygiene: number;
        health: number;
    };

    updateConfirmedAmount: (
        type: keyof typeof donations,
        value: number
    ) => void;

    onAddToHelp: (
        type: keyof typeof donations,
        value: number
    ) => void;

    onDonateNow: (
        type: keyof typeof donations,
        value: number
    ) => void;

    animateHelpButton: (
        button: HTMLElement
    ) => void;

}

export default function DonationCardsGrid({

    confirmedAmounts,
    updateConfirmedAmount,
    onAddToHelp,
    onDonateNow,
    animateHelpButton

}: Props) {


    return (

        <div className="donation-cards-grid">

            {Object.entries(donations).map(([key]) => (

                <DonationCard

                    key={key}

                    type={
                        key as keyof typeof donations
                    }

                    amount={
                        confirmedAmounts[
                        key as keyof typeof confirmedAmounts
                        ]
                    }

                    onAmountChange={(value) => {

                        updateConfirmedAmount(
                            key as keyof typeof donations,
                            value
                        );

                    }}

                    onAddToHelp={onAddToHelp}

                    onDonateNow={onDonateNow}

                    animateHelpButton={animateHelpButton}

                />

            ))}


        </div>

    );

}