"use client";

import { useRegister } from "@/components/hooks/useRegister";
import RegisterForm from "@/components/ui/Auth/RegisterForm";
import RegisterSuccess from "@/components/ui/Auth/RegisterSuccess";


interface Props {

    onClose: () => void;

    onSuccess?: () => void;

}


export default function RegisterContent({
    onClose,
    onSuccess
}: Props) {


    const {
        form,
        errors,
        updateField,
        handleRegister,
        authMessage,
        emailErrorMessage,
        showSuccessModal,

        showPasswordHelp,
        setShowPasswordHelp,

        showPassword,
        setShowPassword,

        showConfirmPassword,
        setShowConfirmPassword,

        passwordStatus,

        emailExistsError

    } = useRegister();



    if (showSuccessModal) {

        return (

            <RegisterSuccess

                onAccept={() => {

                    onSuccess?.();

                    onClose();

                }}

            />

        );

    }

    const registerProps = {

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

    };
    
    return (

        <RegisterForm

            {...registerProps}

        />

    );
}