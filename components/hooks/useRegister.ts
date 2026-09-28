"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

export function useRegister() {

    const {
        t,
        language
    } = useLanguage();
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authMessage, setAuthMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [emailExistsError, setEmailExistsError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [form, setForm] = useState({
        name: "",
        surname: "",
        phone: "",
        country: "",
        birth_date: "",
        email: "",
        password: "",
        confirmPassword: "",

        acceptedPrivacy: false,
        acceptedCommunications: true
    });
    const passwordStatus = passwordRequirements(form.password);
    const [errors, setErrors] = useState({

        name: false,
        surname: false,
        email: false,
        password: false,
        confirmPassword: false,
        acceptedPrivacy: false

    });


    function updateField(
        field: keyof typeof form,
        value: string | boolean
    ) {


        setForm(prev => ({
            ...prev,
            [field]: value
        }));


        if (field === "email") {

            setErrors(prev => ({
                ...prev,
                email: !isValidEmail(String(value))
            }));

            setEmailExistsError(false);
            setEmailErrorMessage("");
            setAuthMessage("");

        } else if (field === "password") {

            setErrors(prev => ({
                ...prev,
                password: !isValidPassword(String(value))
            }));

        } else if (field in errors) {

            setErrors(prev => ({
                ...prev,
                [field]: false
            }));

        }

    }

    function isValidEmail(email: string) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }

    function isValidPassword(password: string) {

        const requirements = passwordRequirements(password);

        return (
            requirements.length &&
            requirements.uppercase &&
            requirements.lowercase &&
            requirements.number &&
            requirements.symbol
        );

    }

    function passwordRequirements(password: string) {

        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password)
        };

    }

    async function handleRegister() {

        const newErrors = {

            name: !form.name,
            surname: !form.surname,
            email: !form.email || !isValidEmail(form.email),
            password: !isValidPassword(form.password),
            confirmPassword: !form.confirmPassword ||
                form.password !== form.confirmPassword,
            acceptedPrivacy: !form.acceptedPrivacy

        };


        setErrors(newErrors);


        if (Object.values(newErrors).some(Boolean)) {

            return;

        }

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback`
                : undefined;

        const { data, error } = await supabase.auth.signUp({

            email: form.email,
            password: form.password,

            options: {

                emailRedirectTo: redirectTo,
                data: {
                    name: form.name,
                    surname: form.surname,
                    phone: form.phone,
                    country: form.country,
                    birth_date: form.birth_date,
                    preferred_language: language,
                    accepted_communications: form.acceptedCommunications
                }

            }

        });

        if (error) {

            if (
                error.message === "User already registered"
            ) {

                setEmailErrorMessage(
                    t.email_already_registered
                );
                setEmailExistsError(true);

                return;

            } else {

                setAuthMessage(
                    error.message
                );

            }


            return;

        }


        if (!data.user) {

            setAuthMessage(
                "No se pudo crear el usuario"
            );

            return;

        }

        if (data.user) {

            setShowSuccessModal(true);

            return;

        }

    }

    return {

        form,

        errors,

        updateField,

        handleRegister,

        authMessage,

        emailErrorMessage,

        emailExistsError,

        showSuccessModal,

        showPasswordHelp,
        setShowPasswordHelp,

        showPassword,
        setShowPassword,

        showConfirmPassword,
        setShowConfirmPassword,

        passwordStatus

    };
}