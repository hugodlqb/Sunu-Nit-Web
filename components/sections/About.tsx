"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import "../../styles/about.css";
import Section from "@/components/ui/Section";
import { images } from "@/data/images";
import { AppImageFill } from "@/components/ui/AppImage";

export default function About() {
    const { t } = useLanguage();
    const [showMore, setShowMore] = useState(false);

    return (
        <Section variant="white" id="about">
            <div className="container">
                <div className="section-header">
                    <h2>{t.about_title}</h2>
                    <p className="section-subtitle">{t.about_subtitle}</p>
                </div>
                <div className="about-grid mb-4">
                    <div className="about-text-content">
                        <h3>{t.our_history}</h3>

                        <p className="about-intro">
                            {t.about_p1}
                        </p>

                        <div className="about-benefits mt-2">
                            <p>
                                <span className="check">✔</span>
                                {t.about_benefit_1}
                            </p>
                            <p>
                                <span className="check">✔</span>
                                {t.about_benefit_2}
                            </p>
                            <p>
                                <span className="check">✔</span>
                                {t.about_benefit_3}
                            </p>
                        </div>
                        
                        <p>{t.about_p2}</p>

                        {!showMore && (
                            <button
                                className="about-read-more"
                                onClick={() => setShowMore(true)}
                            >
                                {t.about_read_more}
                            </button>
                        )}

                        {showMore && (
                            <>
                                <p>{t.about_p3}</p>

                                <p>{t.about_p4}</p>

                                <p>{t.about_p5}</p>

                                <button
                                    className="about-read-more"
                                    onClick={() => setShowMore(false)}
                                >
                                    {t.about_read_less}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="about-team-grid">
                        <div className="team-card">
                            <div className="team-img">
                                <AppImageFill image={images.teamJose} />
                            </div>
                            <h4>{t.team_1_name}</h4>
                            <p className="team-role">{t.team_1_role}</p>
                        </div>
                        <div className="team-card">
                            <div className="team-img">
                                <AppImageFill image={images.teamDiana} />
                            </div>
                            <h4>{t.team_2_name}</h4>
                            <p className="team-role">{t.team_2_role}</p>
                        </div>
                        <div className="team-card">
                            <div className="team-img">
                                <AppImageFill image={images.teamHugo} />
                            </div>
                            <h4>{t.team_3_name}</h4>
                            <p className="team-role">{t.team_3_role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}