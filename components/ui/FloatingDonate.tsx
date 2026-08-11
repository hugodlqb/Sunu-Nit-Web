"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Heart } from "@phosphor-icons/react/dist/ssr";


export default function FloatingDonate() {

    const { t } = useLanguage();

    const [hidden, setHidden] = useState(false);


    useEffect(() => {

        const collaborate = document.getElementById("collaborate");

        if (!collaborate) return;


        const observer = new IntersectionObserver(
            ([entry]) => {

                setHidden(entry.isIntersecting);

            },
            {
                threshold: 0,
                rootMargin: "-80% 0px -5% 0px"
            }
        );


        observer.observe(collaborate);


        return () => observer.disconnect();

    }, []);


    return (
        <a
            href="#collaborate"
            className={`btn btn-primary floating-collab-btn ${hidden ? "hidden" : ""
                }`}
        >
            <Heart size={22} />
            {t.btn_donate_main}
        </a>
    );

}