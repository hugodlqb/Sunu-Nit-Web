"use client";

import "@/styles/hero.css";
import { useLanguage } from "@/context/LanguageContext";
import { AppImageFill } from "@/components/ui/AppImage";
import { images } from "@/data/images";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";


export default function Hero() {

    const { t } = useLanguage();


    return (

        <section
            id="hero"
            className="hero"
        >

            <AppImageFill
                image={images.hero}
                className="hero-image"
                priority
            />


            <div className="hero-image-overlay" />



            <div className="container">

                <div className="hero-content">


                    <span className="hero-badge pulse-soft">

                        {t.hero_badge}

                    </span>

                    <h1>

                        {t.hero_title}

                    </h1>

                    <p
                        className="hero-lead"
                        dangerouslySetInnerHTML={{
                            __html: t.hero_subtitle
                        }}
                    />

                    <div className="hero-actions">


                        <a
                            href="#collaborate"
                            className="btn btn-primary btn-large btn-glow"
                        >

                            {t.btn_collaborate_now}

                        </a>


                    </div>

                    <p className="hero-trust-text mt-2">

                        <ShieldCheck size={22} />

                        {t.hero_trust}

                    </p>




                </div>

            </div>


        </section>

    );

}