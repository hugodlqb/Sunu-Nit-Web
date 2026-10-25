"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import {
    Eye,
    EyeSlash
} from "@phosphor-icons/react/dist/ssr";

export default function ResetPasswordPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const confirmRef = useRef<HTMLInputElement | null>(null);

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
                    } else {
                        // Handle sign-out or missing session so UI doesn't stay on the reset form
                        setStatus("error");
                        setError(t.reset_session_closed);
                    }
                });

                // Normalize subscription object across possible return shapes
                subscription = res?.data?.subscription ?? res?.subscription ?? res;

                // If no session appears within a short time, show an error to the user
                timer = setTimeout(() => {
                    setError(t.reset_link_invalid);
                    setStatus("error");
                }, 10000);
            } catch (err) {
                console.error("Reset callback init error:", err);
                setError(t.reset_link_failed);
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

        if (!password.trim() || !confirmPassword.trim()) {

            setError(t.reset_password_confirm);
            return;
        }

        if (password !== confirmPassword) {

            setError(t.reset_password_mismatch);
            return;
        }

        const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

        if (!sessionData.session) {
            setError(t.reset_session_invalid);
            return;
        }

        setLoading(true);


        const { data, error } = await supabase.auth.updateUser({
            password
        });

        setLoading(false);

        if (error) {
            console.error("[RESET] ❌ Password update error:", error);
            setError(error.message);
            return;
        }

        setMessage(t.reset_password_updated);
        setStatus("success");
    }

    function goHome() {
        router.push("/");
    }

    return (
        <div className="reset-password-page">
            <h1>Restablecer contraseña</h1>

            {status === "loading" && <p>{t.reset_password_verifying}</p>}

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
                    <p>{t.reset_password_page_instruction}</p>

                    <div className="password-container reset-password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input"
                            name="new-password"
                            autoComplete="new-password"
                            placeholder={t.reset_password_new_placeholder}
                            ref={passwordRef}
                            value={password}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            tabIndex={-1}
                            className="password-eye"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>

                        {passwordFocused && password && (
                            <div className="password-help">
                                <p className={password.length >= 8 ? "valid" : "invalid"}>
                                    {password.length >= 8 ? "✓" : "✗"} {t.reset_password_minimum}
                                </p>

                                <p className={/[A-Z]/.test(password) ? "valid" : "invalid"}>
                                    {/[A-Z]/.test(password) ? "✓" : "✗"} {t.reset_password_uppercase}
                                </p>

                                <p className={/[a-z]/.test(password) ? "valid" : "invalid"}>
                                    {/[a-z]/.test(password) ? "✓" : "✗"} {t.reset_password_lowercase}
                                </p>

                                <p className={/[0-9]/.test(password) ? "valid" : "invalid"}>
                                    {/[0-9]/.test(password) ? "✓" : "✗"} {t.reset_password_number}
                                </p>

                                <p className={/[^A-Za-z0-9]/.test(password) ? "valid" : "invalid"}>
                                    {/[^A-Za-z0-9]/.test(password) ? "✓" : "✗"} {t.reset_password_special}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="password-container reset-password-field">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-input"
                            name="confirm-password"
                            autoComplete="new-password"
                            placeholder={t.reset_password_confirm_placeholder}
                            ref={confirmRef}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                        />

                        <button
                            type="button"
                            tabIndex={-1}
                            className="password-eye"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword
                                ? <EyeSlash size={20} />
                                : <Eye size={20} />
                            }
                        </button>
                    </div>

                    {error && <div className="auth-message error">{error}</div>}

                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={handleUpdatePassword}
                        disabled={loading}
                    >
                        {loading ? t.reset_password_updating : t.reset_password_update_button}
                    </button>

                    <button type="button" className="btn btn-secondary" onClick={goHome}>
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
