"use client";

import { donations } from "@/data/donations";
import { useLanguage } from "@/context/LanguageContext";
import {
    XCircle,
    Heart,
    PlusCircle
} from "@phosphor-icons/react/dist/ssr";


interface Props {

    selectedDonation: keyof typeof donations;

    currentDonation: typeof donations[keyof typeof donations];

    amount: number;

    setAmount: (value: number) => void;

    closeDonation: () => void;

    addToHelp: (
        type: keyof typeof donations,
        value: number
    ) => void;

    animateHelpButton: (
        button: HTMLElement
    ) => void;

}


export default function DonationModal({

    selectedDonation,
    currentDonation,
    amount,
    setAmount,
    closeDonation,
    addToHelp,
    animateHelpButton

}: Props) {


    const { t } = useLanguage();


    const calculatedUnits = Math.floor(
        amount /
        currentDonation.price *
        currentDonation.units
    );


    const impactText =
        `${calculatedUnits} ${t[`don_${selectedDonation}_unit`]}`;


    return (

        <div
            className="donation-overlay"
            onClick={closeDonation}
        >

            <div
                className="donation-slide"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="close-slide"
                    onClick={closeDonation}
                >

                    <XCircle
                        size={34}
                        weight="fill"
                        color="#dc2626"
                    />

                </button>


                <h2>
                    {t[`don_${selectedDonation}_title`]}
                </h2>


                <p>
                    {t[`detalle_don_${selectedDonation}`]}
                </p>


                <div className="slider-info">

                    <div className="amount-control">

                        <input
                            className="donation-visible-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />

                        <span>€/{t.permonth}</span>

                    </div>


                    <div className="impact-control">

                        <span>
                            {t.impact_label}
                        </span>

                        {" "}
                        {impactText}

                    </div>

                </div>


                <button
                    className="btn btn-primary action-btn"
                    onClick={(e) => {

                        addToHelp(
                            selectedDonation,
                            amount
                        );


                        animateHelpButton(
                            e.currentTarget
                        );


                    }}
                >

                    <Heart
                        size={22}
                        weight="fill"
                        color="white"
                    />

                    {t.help_now}

                </button>



                <button
                    className="btn btn-outline action-btn"
                    onClick={() => {

                        addToHelp(
                            selectedDonation,
                            amount
                        );

                    }}
                >

                    <PlusCircle size={22} />

                    {t.add_to_help}

                </button>


            </div>

        </div>

    )

}