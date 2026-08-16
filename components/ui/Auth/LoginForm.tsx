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
            setError(t.login_error);

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
            setResetError(t.reset_password_instruction);
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

        setResetMessage(t.reset_password_success);

    }


    return (

        <>

            {!showResetForm && (
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
                                    ? <EyeSlash size={20} />
                                    : <Eye size={20} />
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

                </>
            )}

            {!showResetForm && (
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
            )}

            {showResetForm ? (
                <div className="reset-password-panel">
                    <p>{t.reset_password_instruction}</p>

                    <input
                        type="email"
                        placeholder={t.register_email}
                        className="form-input"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />

                    {resetError && (
                        <div className="auth-message error reset-auth-message">
                            {resetError}
                        </div>
                    )}

                    {resetMessage && (
                        <div className="auth-message success reset-auth-message">
                            {resetMessage}
                        </div>
                    )}

                    <button
                        className="btn btn-secondary w-100"
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                    >
                        {resetLoading
                            ? t.reset_password_loading
                            : t.reset_password_button}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary reset-back-button"
                        onClick={() => setShowResetForm(false)}
                    >
                        {t.reset_password_back}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className="btn btn-secondary forgot-password"
                    onClick={() => {
                        setShowResetForm(true);
                        setResetError("");
                        setResetMessage("");
                    }}
                >
                    {t.forgot_password}
                </button>
            )}


        </>

    );

}