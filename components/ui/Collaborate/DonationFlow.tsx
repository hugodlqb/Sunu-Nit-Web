"use client";

import { XCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { DonationOrigin } from "@/components/hooks/useCollaborate";
import { useLanguage } from "@/context/LanguageContext";

interface Props {

    origin: DonationOrigin;

    amount: number;

    setAmount: (value: number) => void;

    isMonthly: boolean;

    setIsMonthly: (value: boolean) => void;

    close: () => void;

    onContinue: () => void;

}

export default function DonationFlow({

    origin,
    amount,
    setAmount,
    isMonthly,
    setIsMonthly,
    close,
    onContinue

}: Props) {

    const { t } = useLanguage();

    let title = "Tu donación";

    let description = "";

    if (origin.type === "thematic") {

        const donation =
            origin.donationType;

        title =
            t[`don_${donation}_title`];

        description =
            t[`don_${donation}_desc`];

    }

    if (origin.type === "project") {

        title = `${t.project_donation_title}: ${origin.projectName}`;

        description =
            t.project_donation_description;

    }

    if (origin.type === "free") {

        title = "Donación libre";

        description =
            "Elige la cantidad que quieres donar.";

    }

    return (

        <div
            className="donation-overlay"
            onClick={close}
        >

            <div
                className="donation-slide"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <button
                    className="close-slide"
                    onClick={close}
                >

                    <XCircle
                        size={34}
                        weight="fill"
                    />

                </button>


                <h2>
                    {title}
                </h2>


                <p>
                    {description}
                </p>


                <div className="donation-flow-amount">

                    <label>
                        Cantidad
                    </label>

                    <div>

                        <input
                            type="number"
                            min={1}
                            value={amount}
                            onChange={(e) =>
                                setAmount(
                                    Number(e.target.value)
                                )
                            }
                        />

                        <span>€</span>

                    </div>

                </div>

                <div className="donation-flow-frequency">

                    <button
                        type="button"
                        className={`donation-frequency-btn ${!isMonthly ? "active" : ""
                            }`}
                        onClick={() => setIsMonthly(false)}
                    >
                        Una vez
                    </button>

                    <button
                        type="button"
                        className={`donation-frequency-btn ${isMonthly ? "active" : ""
                            }`}
                        onClick={() => setIsMonthly(true)}
                    >
                        Mensualmente
                    </button>

                </div>

                <button
                    type="button"
                    className="btn btn-primary donation-flow-continue"
                    onClick={() => {
                        onContinue();
                    }}
                >
                    {origin.type === "project"
                        ? t.project_donate
                        : "Continuar"}
                    <ArrowRight size={22} />
                </button>

            </div>

        </div>

    );

}
