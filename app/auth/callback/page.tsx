"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {

    const router = useRouter();

    useEffect(() => {

        async function completeLogin() {

            const { error } = await supabase.auth.exchangeCodeForSession(
                window.location.href
            );

            if (error) {

                console.error(error);

                router.replace("/");

                return;

            }

            router.replace("/");

        }

        completeLogin();

    }, [router]);

    return <p>Confirmando cuenta...</p>;

}