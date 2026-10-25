"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {

    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {

        async function completeLogin() {

            const { error } = await supabase.auth.exchangeCodeForSession(
                window.location.href
            );

            if (error) {

                console.error("Auth callback error:", error);

                router.replace("/");

                return;

            }

            router.replace("/");

        }

        completeLogin();

    }, [router]);

    return <p>{t.auth_callback_confirming}</p>;

}