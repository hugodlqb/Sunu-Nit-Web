"use client";

import { useLanguage } from "@/context/LanguageContext";


export default function AccountProfile() {
    const { t } = useLanguage();


    return (

        <div>
            <h2>
                {t.account_settings}
            </h2>
        </div>

    );


}