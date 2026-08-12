"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
    onSuccess?: () => void;
}


export default function LoginForm({
    onSuccess
}: Props) {

    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [showResetForm, setShowResetForm] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetMessage, setResetMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);



    async function handleLogin() {


        setError("");
        setLoading(true);


        const {
            error
        } = await supabase.auth.signInWithPassword({

            email,
            password

        });


        setLoading(false);



        if (error) {

            console.error(error);

            setError(
                "Correo o contraseña incorrectos"
            );

            return;

        }


        if (onSuccess) {
            onSuccess();
        }

    }

    async function handleResetPassword() {

        setResetError("");
        setResetMessage("");

        if (!resetEmail) {
            setResetError("Introduce tu correo para recibir el enlace de recuperación.");
            return;
        }

        setResetLoading(true);

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/auth/reset`
                : undefined;

        const { error } = await (supabase.auth as any).resetPasswordForEmail(
            resetEmail,
            {
                redirectTo
            }
        );

        setResetLoading(false);

        if (error) {
            console.error("Error sending reset email:", error);
            setResetError(error.message);
            return;
        }

        setResetMessage(
            "Si el correo existe, te hemos enviado un enlace para restablecer la contraseña."
        );

    }


    return (

        <>


            <input
                type="email"
                placeholder={t.register_email}
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />


            <div className="password-container">


                <input

                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }

                    placeholder={t.register_password}

                    className="form-input"

                    value={password}

                    onChange={(e) =>
                        setPassword(e.target.value)
                    }

                />


                <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                        setShowPassword(!showPassword)
                    }
                >

                    {
                        showPassword
                            ?
                            <EyeSlash size={20} />
                            :
                            <Eye size={20} />
                    }


                </button>


            </div>


            {
                error && (

                    <div className="auth-message error">
                        {error}
                    </div>

                )
            }

            {showResetForm ? (
                <div className="reset-password-panel">
                    <p>Introduce tu correo para recibir un enlace de recuperación.</p>

                    <input
                        type="email"
                        placeholder={t.register_email}
                        className="form-input"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />

                    {resetError && (
                        <div className="auth-message error">
                            {resetError}
                        </div>
                    )}

                    {resetMessage && (
                        <div className="auth-message success">
                            {resetMessage}
                        </div>
                    )}

                    <button
                        className="btn btn-secondary w-100"
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                    >
                        {resetLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </button>

                    <button
                        type="button"
                        className="link-button"
                        onClick={() => setShowResetForm(false)}
                    >
                        Volver al login
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className="link-button forgot-password"
                    onClick={() => {
                        setShowResetForm(true);
                        setResetError("");
                        setResetMessage("");
                    }}
                >
                    ¿Has olvidado tu contraseña?
                </button>
            )}

            <button
                className="btn btn-primary w-100"
                onClick={handleLogin}
                disabled={loading}
            >
                {
                    loading
                        ?
                        t.login_loading
                        :
                        t.login_button
                }

            </button>


        </>

    );

}