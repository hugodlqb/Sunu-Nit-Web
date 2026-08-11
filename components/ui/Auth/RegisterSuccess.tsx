"use client";

import { useLanguage } from "@/context/LanguageContext";
interface Props {

    onAccept: () => void;

}


export default function RegisterSuccess({
    
    onAccept
}: Props) {

    const { t } = useLanguage();

    return (

        <div className="register-overlay">

            <div className="register-modal success-modal">

                <h2>
                    {t.register_success_title}
                </h2>

                <p>
                    {t.register_success_message}
                </p>
                <button
                    className="btn btn-primary"
                    onClick={onAccept}
                >
                    {t.accept}
                </button>


            </div>

        </div>

    );

}