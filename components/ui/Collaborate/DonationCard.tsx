"use client";

import { donations } from "@/data/donations";
import { useLanguage } from "@/context/LanguageContext";
import {
    Heart,
    PlusCircle,
} from "@phosphor-icons/react/dist/ssr";

interface Props {

    type: keyof typeof donations;

    amount: number;

    onAmountChange: (value: number) => void;

    onAddToHelp: (
        type: keyof typeof donations,
        value: number
    ) => void;

    animateHelpButton: (
        button: HTMLElement
    ) => void;

}

export default function DonationCard({

    type,
    amount,
    onAmountChange,
    onAddToHelp,
    animateHelpButton

}: Props) {

    const { t } = useLanguage();

    const data = donations[type];
    const Icon = data.icon;


    return (

        <div
            className="thematic-card-v5"
        >

            <div className="thematic-content-v5">


                <div className="thematic-title">

                    <div
                        className={`thematic-badge-v5 bg-${data.color}-light`}
                    >

                        <Icon />

                    </div>


                    <h4>
                        {t[`don_${type}_title` as keyof typeof t]}
                    </h4>


                </div>


                <p>
                    {t[`don_${type}_desc` as keyof typeof t]}
                </p>


                <div className="impact-main">

                    <span className="impact-number">

                        <span className="impact-number">

                            {
                                Math.floor(
                                    amount / data.price * data.units
                                )
                            }

                        </span>


                    </span>


                    <span className="impact-text">

                        {t[`don_${type}_impact_unit` as keyof typeof t]}

                    </span>


                </div>

                <input

                    type="range"

                    min={data.min}

                    max={data.max}

                    step={data.step}

                    value={amount}

                    onChange={(e) => {

                        onAmountChange(
                            Number(e.target.value)
                        );

                    }}

                />

                <div className="thematic-bottom-v5">


                    <div className={`thematic-amount-v5 text-${data.color}`}>

                        {amount}€

                        <span className="price-freq">
                            /{t.permonth}
                        </span>

                    </div>


                    <div className="thematic-actions">


                        <button
                            className="btn btn-primary action-btn"
                        >

                            <Heart
                                size={24}
                                weight="fill"
                                color="white"
                            />

                            {t.help_now}

                        </button>

                        <button
                            className="btn btn-outline action-btn"
                            onClick={(e) => {

                                onAddToHelp(
                                    type,
                                    amount
                                );

                                animateHelpButton(
                                    e.currentTarget
                                );

                            }}
                        >

                            <PlusCircle size={24} />

                            {t.add_to_help}

                        </button>


                    </div>


                </div>


            </div>


        </div>

    );

}