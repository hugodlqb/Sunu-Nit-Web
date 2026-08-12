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
        async function restoreSession() {
            const { data, error } = await (supabase.auth as any).getSessionFromUrl({ storeSession: true });

            if (error) {
                console.error("Reset callback error:", error);
                setError("No se pudo completar el enlace de recuperación.");
                setStatus("error");
                return;
            }

            if (!data?.session) {
                setError("Enlace de recuperación inválido o caducado.");
                setStatus("error");
                return;
            }

            setStatus("ready");
        }

        restoreSession();
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
