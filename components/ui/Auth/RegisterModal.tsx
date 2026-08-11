"use client";

import {
    XCircle,
} from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import "@/styles/auth.css";
import RegisterContent from "@/components/ui/Auth/RegisterContent";

interface Props {
    onClose: () => void;
    onSuccess?: () => void;

}


export default function RegisterModal({
    onClose,
    onSuccess
}: Props) {

    const { t } = useLanguage();


    return (

        <>


            <div
                className="register-overlay"
                onClick={onClose}
            >

                <div
                    className="register-modal"
                    onClick={(e) => e.stopPropagation()}
                >


                    <button
                        className="close-slide"
                        onClick={onClose}
                    >

                        <XCircle
                            size={34}
                            weight="fill"
                        />

                    </button>

                    <h2>{t.register_title}</h2>

                    <p>{t.register_subtitle}</p>

                    <RegisterContent

                        onClose={onClose}

                        onSuccess={onSuccess}

                    />

                </div>


            </div>

        </>
    );

}