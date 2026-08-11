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

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);



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