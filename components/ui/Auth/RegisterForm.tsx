"use client";

import {
    Eye,
    EyeSlash
} from "@phosphor-icons/react/dist/ssr";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import PasswordFields from "@/components/ui/Auth/PasswordFields";
import { useLanguage } from "@/context/LanguageContext";
import { useRef } from "react";

type RegisterFormData = {

    name: string;

    surname: string;

    phone: string;

    country: string;


    email: string;

    password: string;

    confirmPassword: string;


    acceptedPrivacy: boolean;

    acceptedCommunications: boolean;

};

interface Props {


    form: RegisterFormData;


    errors: any;


    updateField: (

        field: keyof RegisterFormData,

        value: string | boolean

    ) => void;


    handleRegister: () => void;


    authMessage: string;


    emailErrorMessage: string;


    emailExistsError: boolean;



    showPasswordHelp: boolean;

    setShowPasswordHelp: (
        value: boolean
    ) => void;



    showPassword: boolean;

    setShowPassword: (
        value: boolean
    ) => void;



    showConfirmPassword: boolean;

    setShowConfirmPassword: (
        value: boolean
    ) => void;



    passwordStatus: any;


}


export default function RegisterForm({

    form,
    errors,
    updateField,
    handleRegister,
    authMessage,
    emailErrorMessage,
    emailExistsError,

    showPasswordHelp,
    setShowPasswordHelp,

    showPassword,
    setShowPassword,

    showConfirmPassword,
    setShowConfirmPassword,

    passwordStatus

}: Props) {


    const { t } = useLanguage();
    const phoneInputRef = useRef<HTMLInputElement | null>(null);

    return (

        <div className="register-form">


            <div className="form-row">

                <input
                    className={`form-input ${errors.name ? "input-error" : ""}`}
                    type="text"
                    placeholder={t.register_name}
                    value={form.name}
                    onChange={(e) =>
                        updateField(
                            "name",
                            e.target.value
                        )
                    }
                />


                <input
                    className={`form-input ${errors.surname ? "input-error" : ""}`}
                    type="text"
                    placeholder={t.register_surname}
                    value={form.surname}
                    onChange={(e) =>
                        updateField(
                            "surname",
                            e.target.value
                        )
                    }
                />

            </div>


            <div className="form-row">


                <div className="email-container">

                    <input
                        className={`form-input ${errors.email || emailExistsError
                            ? "input-error"
                            : ""
                            }`}
                        type="email"
                        placeholder={t.register_email}
                        value={form.email}
                        onChange={(e) =>
                            updateField(
                                "email",
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Tab" && !e.shiftKey) {
                                setTimeout(() => {
                                    const phoneInput = document.querySelector(
                                        ".phone-wrapper input[type='tel']"
                                    ) as HTMLInputElement | null;

                                    if (phoneInput) {
                                        phoneInput.focus();

                                        const length = phoneInput.value.length;

                                        phoneInput.setSelectionRange(length, length);
                                    }
                                }, 0);
                            }
                        }}
                    />


                    {
                        emailErrorMessage && (

                            <div className="email-help">

                                <p className="invalid">
                                    ✗ {emailErrorMessage}
                                </p>

                            </div>

                        )
                    }


                </div>


                <div className="phone-wrapper">

                    <PhoneInput
                        international
                        defaultCountry="ES"

                        countrySelectProps={{
                            tabIndex: -1,
                            "aria-hidden": true
                        }}

                        numberInputProps={{
                            tabIndex: 0,
                            autoComplete: "tel",
                            ref: phoneInputRef
                        }}

                        value={form.phone}

                        onChange={(value) => {
                            updateField(
                                "phone",
                                value || ""
                            );
                        }}
                    />


                </div>


            </div>

            <PasswordFields

                password={form.password}

                confirmPassword={form.confirmPassword}


                updateField={updateField}


                errorPassword={errors.password}

                errorConfirmPassword={errors.confirmPassword}


                showPasswordHelp={showPasswordHelp}

                setShowPasswordHelp={setShowPasswordHelp}


                showPassword={showPassword}

                setShowPassword={setShowPassword}


                showConfirmPassword={showConfirmPassword}

                setShowConfirmPassword={setShowConfirmPassword}


                passwordStatus={passwordStatus}


                placeholderPassword={t.register_password}

                placeholderConfirmPassword={t.register_confirm_password}

            />

            <div className="privacy-row">


                <label
                    className={`privacy-check ${errors.acceptedPrivacy
                        ? "check-error"
                        : ""
                        }`}
                >

                    <input

                        type="checkbox"

                        checked={form.acceptedPrivacy}

                        onChange={(e) =>
                            updateField(
                                "acceptedPrivacy",
                                e.target.checked
                            )
                        }

                    />

                    <span>
                        {t.register_accept_privacy}
                    </span>


                </label>




                <label className="privacy-check">


                    <input

                        type="checkbox"

                        checked={
                            form.acceptedCommunications
                        }

                        onChange={(e) =>
                            updateField(
                                "acceptedCommunications",
                                e.target.checked
                            )
                        }

                    />


                    <span>
                        {t.register_accept_news}
                    </span>


                </label>


            </div>




            <div className="register-button-row">


                <button

                    className="btn btn-primary register-submit"

                    onClick={handleRegister}

                >

                    {t.register_button}


                </button>



                {
                    authMessage && (

                        <div className="auth-message">

                            {authMessage}

                        </div>

                    )
                }


            </div>



        </div>

    )

}