"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        let subscription: any = null;

        async function init() {
            try {
                // Try to read an existing session first
                const getSessionRes: any = await supabase.auth.getSession();
                const currentSession = getSessionRes?.data?.session ?? getSessionRes?.session ?? null;

                if (currentSession) {
                    setStatus("ready");
                    return;
                }

                // Listen for auth state changes (e.g., Supabase restores a session after the redirect)
                const res: any = supabase.auth.onAuthStateChange((event: string, session: any) => {
                    if (session) {
                        setStatus("ready");
                    }
                });

                // Normalize subscription object across possible return shapes
                subscription = res?.data?.subscription ?? res?.subscription ?? res;

                // If no session appears within a short time, show an error to the user
                timer = setTimeout(() => {
                    setError("Enlace de recuperación inválido o caducado.");
                    setStatus("error");
                }, 10000);
            } catch (err) {
                console.error("Reset callback init error:", err);
                setError("No se pudo completar el enlace de recuperación.");
                setStatus("error");
            }
        }

        init();

        return () => {
            if (timer) clearTimeout(timer);
            try {
                subscription?.unsubscribe?.();
            } catch (e) {
                // ignore unsubscribe errors
            }
        };
    }, []);

    async function handleUpdatePassword() {
        setError("");
        setMessage("");

        if (!password || !confirmPassword) {
            setError("Introduce la nueva contraseña y confírmala.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        setLoading(false);

        if (error) {
            console.error("Password update error:", error);
            setError(error.message);
            return;
        }

        setMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
        setStatus("success");
    }

    function goHome() {
        router.push("/");
    }

    return (
        <div className="reset-password-page">
            <h1>Restablecer contraseña</h1>

            {status === "loading" && <p>Verificando el enlace de recuperación...</p>}

            {status === "error" && (
                <>
                    <div className="auth-message error">{error}</div>
                    <button type="button" className="btn btn-secondary" onClick={goHome}>
                        Volver al inicio
                    </button>
                </>
            )}

            {status === "ready" && (
                <>
                    <p>Introduce la nueva contraseña para completar el restablecimiento.</p>

                    <input
                        type="password"
                        className="form-input"
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        className="form-input"
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <div className="auth-message error">{error}</div>}

                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={handleUpdatePassword}
                        disabled={loading}
                    >
                        {loading ? "Actualizando..." : "Actualizar contraseña"}
                    </button>

                    <button type="button" className="link-button" onClick={goHome}>
                        Volver al inicio
                    </button>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="auth-message success">{message}</div>
                    <button type="button" className="btn btn-primary" onClick={goHome}>
                        Ir al inicio
                    </button>
                </>
            )}
        </div>
    );
}
