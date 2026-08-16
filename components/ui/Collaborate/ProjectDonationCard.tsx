"use client";

import {
    FolderOpen,
    Heart
} from "@phosphor-icons/react/dist/ssr";

interface Props {

    id: string;

    name: string;

    description: string;

    image: string | null;

    targetAmount: number;

    currentAmount: number;

    currency: string;

    onDonate: (
        projectId: string
    ) => void;

}

export default function ProjectDonationCard({

    id,
    name,
    description,
    image,
    targetAmount,
    currentAmount,
    currency,
    onDonate

}: Props) {

    const progress =
        targetAmount > 0
            ? Math.min(
                (currentAmount / targetAmount) * 100,
                100
            )
            : 0;

    return (

        <article className="project-donation-card">

            <div className="project-donation-image">

                {image ? (

                    <img
                        src={image}
                        alt={name}
                    />

                ) : (

                    <FolderOpen size={48} />

                )}

            </div>


            <div className="project-donation-content">

                <h4>
                    {name}
                </h4>


                <p>
                    {description}
                </p>


                <div className="project-donation-progress">

                    <div className="project-donation-progress-bar">

                        <div
                            className="project-donation-progress-fill"
                            style={{
                                width: `${progress}%`
                            }}
                        />

                    </div>


                    <div className="project-donation-progress-info">

                        <span>
                            {currentAmount.toLocaleString("es-ES")}
                            {" "}
                            {currency}
                        </span>

                        <span>
                            {targetAmount.toLocaleString("es-ES")}
                            {" "}
                            {currency}
                        </span>

                    </div>

                </div>


                <button
                    className="btn btn-primary"
                    onClick={() => onDonate(id)}
                >

                    <Heart
                        size={20}
                        weight="fill"
                    />

                    Donar a este proyecto

                </button>

            </div>

        </article>

    );
}