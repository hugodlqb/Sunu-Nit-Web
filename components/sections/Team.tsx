"use client";

import { useLanguage } from "@/context/LanguageContext";


export default function Team() {

    const { t } = useLanguage();


    return (

        <div className="about-team-grid">

            <div className="team-card">

                <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300"
                    className="team-img"
                    alt="Jose Pandares"
                />

                <h4>
                    {t.team_1_name}
                </h4>

                <p className="team-role">
                    {t.team_1_role}
                </p>

            </div>


            <div className="team-card">

                <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300"
                    className="team-img"
                    alt="Diana Miquel"
                />

                <h4>
                    {t.team_2_name}
                </h4>

                <p className="team-role">
                    {t.team_2_role}
                </p>

            </div>


            <div className="team-card">

                <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300"
                    className="team-img"
                    alt="Hugo de la Quintana"
                />

                <h4>
                    {t.team_3_name}
                </h4>

                <p className="team-role">
                    {t.team_3_role}
                </p>

            </div>

        </div>

    );
}