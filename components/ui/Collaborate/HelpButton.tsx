"use client";

import { Handshake } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";


interface Props {
    onClick: () => void;
}


export default function HelpButton({
    onClick
}: Props) {

    const { t } = useLanguage();


    return (

        <button
            className="help-icon-button"
            aria-label="Mi ayuda"
            onClick={onClick}
        >

            <Handshake
                size={28}
                weight="fill"
            />

            <span className="help-button-text">
                {t.help_button}
            </span>

        </button>

    );

}