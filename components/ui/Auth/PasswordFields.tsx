"use client";

import {
    Eye,
    EyeSlash
} from "@phosphor-icons/react/dist/ssr";


interface Props {

    password: string;

    confirmPassword: string;

    updateField: (
        field:
            | "password"
            | "confirmPassword",
        value: string
    ) => void;


    errorPassword: boolean;

    errorConfirmPassword: boolean;


    showPasswordHelp: boolean;

    setShowPasswordHelp: (value: boolean) => void;


    showPassword: boolean;

    setShowPassword: (value: boolean) => void;


    showConfirmPassword: boolean;

    setShowConfirmPassword: (value: boolean) => void;


    passwordStatus: any;


    placeholderPassword: string;

    placeholderConfirmPassword: string;

}



export default function PasswordFields({

    password,
    confirmPassword,
    updateField,

    errorPassword,
    errorConfirmPassword,

    showPasswordHelp,
    setShowPasswordHelp,

    showPassword,
    setShowPassword,

    showConfirmPassword,
    setShowConfirmPassword,

    passwordStatus,

    placeholderPassword,
    placeholderConfirmPassword


}: Props) {


    return (

        <div className="form-row">


            <div className="password-container">

                <input
                    className={`form-input ${errorPassword ? "input-error" : ""}`}

                    type={showPassword ? "text" : "password"}

                    placeholder={placeholderPassword}

                    value={password}


                    onFocus={() =>
                        setShowPasswordHelp(true)
                    }


                    onBlur={() =>
                        setShowPasswordHelp(false)
                    }


                    onChange={(e) =>
                        updateField(
                            "password",
                            e.target.value
                        )
                    }

                />


                <button
                    type="button"

                    tabIndex={-1}

                    className="password-eye"

                    onMouseDown={(e) =>
                        e.preventDefault()
                    }

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



                {
                    showPasswordHelp && password && (

                        <div className="password-help">


                            <p className={passwordStatus.length ? "valid" : "invalid"}>

                                {passwordStatus.length ? "✓" : "✗"}
                                {" "}Mínimo 8 caracteres

                            </p>


                            <p className={passwordStatus.uppercase ? "valid" : "invalid"}>

                                {passwordStatus.uppercase ? "✓" : "✗"}
                                {" "}Una letra mayúscula

                            </p>


                            <p className={passwordStatus.lowercase ? "valid" : "invalid"}>

                                {passwordStatus.lowercase ? "✓" : "✗"}
                                {" "}Una letra minúscula

                            </p>


                            <p className={passwordStatus.number ? "valid" : "invalid"}>

                                {passwordStatus.number ? "✓" : "✗"}
                                {" "}Un número

                            </p>


                            <p className={passwordStatus.symbol ? "valid" : "invalid"}>

                                {passwordStatus.symbol ? "✓" : "✗"}
                                {" "}Un carácter especial

                            </p>


                        </div>

                    )
                }


            </div>



            <div className="password-container">


                <input

                    className={`form-input ${errorConfirmPassword ? "input-error" : ""}`}


                    type={
                        showConfirmPassword
                            ?
                            "text"
                            :
                            "password"
                    }


                    placeholder={placeholderConfirmPassword}


                    value={confirmPassword}


                    onChange={(e) =>

                        updateField(
                            "confirmPassword",
                            e.target.value
                        )

                    }

                />



                <button

                    type="button"

                    tabIndex={-1}

                    className="password-eye"


                    onMouseDown={(e) =>
                        e.preventDefault()
                    }


                    onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                    }

                >

                    {
                        showConfirmPassword

                            ?

                            <EyeSlash size={20} />

                            :

                            <Eye size={20} />

                    }


                </button>


            </div>


        </div>

    );


}