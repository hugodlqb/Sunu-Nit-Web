"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Heart } from "@phosphor-icons/react/dist/ssr";

interface Props {
    accountOpen: boolean;
}

export default function FloatingDonate({
    accountOpen,
}: Props) {

    const { t } = useLanguage();

    const [hidden, setHidden] = useState(false);

    useEffect(() => {

        const collaborate =
            document.getElementById("collaborate");

        if (!collaborate) return;

        const observer =
            new IntersectionObserver(
                ([entry]) => {
                    setHidden(
                        entry.isIntersecting
                    );
                },
                {
                    threshold: 0,
                    rootMargin:
                        "-80% 0px -5% 0px"
                }
            );

        observer.observe(collaborate);

        return () =>
            observer.disconnect();

    }, []);

    const isHidden =
        accountOpen || hidden;

    return (
        <a
            href="/#collaborate"
            onClick={() => {
                window.dispatchEvent(
                    new Event(
                        "close-navigation-overlays"
                    )
                );
            }}
            className={`btn btn-primary floating-collab-btn ${
                isHidden ? "hidden" : ""
            }`}
        >
            <Heart size={22} />
            {t.btn_donate_main}
        </a>
    );
}