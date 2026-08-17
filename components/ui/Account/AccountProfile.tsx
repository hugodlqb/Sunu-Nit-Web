"use client";

import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountProfile() {

    const {
        user,
        profile,
        updateProfile
    } = useAuth();

    const { t } = useLanguage();

    const [editing, setEditing] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState(false);

    const [form, setForm] = useState({
        name: "",
        surname: "",
        phone: "",
        country: "",
        preferred_language: "es",
        accepted_communications: false
    });

    useEffect(() => {

        if (!profile) return;

        setForm({
            name: profile.name ?? "",
            surname: profile.surname ?? "",
            phone: profile.phone ?? "",
            country: profile.country ?? "",
            preferred_language:
                profile.preferred_language ?? "es",
            accepted_communications:
                profile.accepted_communications ?? false
        });

    }, [profile]);

    function handleChange(
        field: keyof typeof form,
        value: string | boolean
    ) {

        setForm(prev => ({
            ...prev,
            [field]: value
        }));

        setError(null);
        setSuccess(false);
    }

    function startEditing() {

        if (!profile) return;

        setForm({
            name: profile.name ?? "",
            surname: profile.surname ?? "",
            phone: profile.phone ?? "",
            country: profile.country ?? "",
            preferred_language:
                profile.preferred_language ?? "es",
            accepted_communications:
                profile.accepted_communications ?? false
        });

        setError(null);
        setSuccess(false);
        setEditing(true);
    }

    function cancelEditing() {

        if (!profile) return;

        setForm({
            name: profile.name ?? "",
            surname: profile.surname ?? "",
            phone: profile.phone ?? "",
            country: profile.country ?? "",
            preferred_language:
                profile.preferred_language ?? "es",
            accepted_communications:
                profile.accepted_communications ?? false
        });

        setError(null);
        setSuccess(false);
        setEditing(false);
    }

    async function handleSave() {

        setSaving(true);
        setError(null);
        setSuccess(false);

        const result = await updateProfile(form);

        setSaving(false);

        if (result) {
            setError(result);
            return;
        }

        setSuccess(true);
        setEditing(false);
    }

    if (!profile) {

        return (
            <div className="account-profile">
                <h2>{t.account_profile}</h2>
                <p>{t.account_profile_not_found}</p>
            </div>
        );
    }

    return (
        <div className="account-profile">

            <div className="account-profile-header">
                <h2>{t.account_profile}</h2>
            </div>

            {error && (
                <div className="account-profile-message error">
                    {error}
                </div>
            )}

            {success && (
                <div className="account-profile-message success">
                    {t.account_profile_saved}
                </div>
            )}

            <div className="account-profile-fields">

                <div className="account-profile-row">

                    <strong>
                        {t.register_name}:
                    </strong>

                    {editing ? (
                        <input
                            type="text"
                            value={form.name}
                            onChange={e =>
                                handleChange(
                                    "name",
                                    e.target.value
                                )
                            }
                        />
                    ) : (
                        <span>
                            {profile.name ?? "—"}
                        </span>
                    )}

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.register_surname}:
                    </strong>

                    {editing ? (
                        <input
                            type="text"
                            value={form.surname}
                            onChange={e =>
                                handleChange(
                                    "surname",
                                    e.target.value
                                )
                            }
                        />
                    ) : (
                        <span>
                            {profile.surname ?? "—"}
                        </span>
                    )}

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.register_email}:
                    </strong>

                    <span>
                        {user?.email ?? "—"}
                    </span>

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.profile_phone}:
                    </strong>

                    {editing ? (
                        <PhoneInput
                            international
                            defaultCountry="ES"

                            countrySelectProps={{
                                tabIndex: -1,
                                "aria-hidden": true
                            }}

                            numberInputProps={{
                                autoComplete: "tel"
                            }}

                            value={form.phone}

                            onChange={(value) => {
                                handleChange(
                                    "phone",
                                    value || ""
                                );
                            }}
                        />
                    ) : (
                        <span>
                            {profile.phone || "—"}
                        </span>
                    )}

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.profile_country}:
                    </strong>

                    {editing ? (
                        <input
                            type="text"
                            value={form.country}
                            onChange={e =>
                                handleChange(
                                    "country",
                                    e.target.value
                                )
                            }
                        />
                    ) : (
                        <span>
                            {profile.country || "—"}
                        </span>
                    )}

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.profile_language}:
                    </strong>

                    {editing ? (
                        <select
                            value={form.preferred_language}
                            onChange={e =>
                                handleChange(
                                    "preferred_language",
                                    e.target.value
                                )
                            }
                        >
                            <option value="es">
                                Español
                            </option>

                            <option value="en">
                                English
                            </option>

                            <option value="fr">
                                Français
                            </option>
                        </select>
                    ) : (
                        <span>
                            {profile.preferred_language === "en"
                                ? "English"
                                : profile.preferred_language === "fr"
                                    ? "Français"
                                    : "Español"}
                        </span>
                    )}

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.profile_communications}:
                    </strong>

                    {editing ? (

                        <label>
                            <input
                                type="checkbox"
                                checked={
                                    form.accepted_communications
                                }
                                onChange={e =>
                                    handleChange(
                                        "accepted_communications",
                                        e.target.checked
                                    )
                                }
                            />

                            <span>
                                {t.register_accept_news}
                            </span>
                        </label>

                    ) : (
                        <span>
                            {profile.accepted_communications
                                ? t.profile_communications_yes
                                : t.profile_communications_no}
                        </span>
                    )}

                </div>

                <div className="account-profile-row">

                    <strong>
                        {t.profile_created_at}:
                    </strong>

                    <span>
                        {new Date(
                            profile.created_at
                        ).toLocaleDateString()}
                    </span>

                </div>

            </div>

            {!editing && (
                <div className="account-actions">
                    <button
                        className="btn btn-outline"
                        onClick={startEditing}
                    >
                        {t.account_profile_edit}
                    </button>
                </div>
            )}

            {editing && (

                <div className="account-actions">

                    <button
                        className="btn btn-outline"
                        onClick={cancelEditing}
                        disabled={saving}
                    >
                        {t.cancel}
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? t.profile_saving
                            : t.profile_save}
                    </button>

                </div>

            )}

        </div>
    );
}