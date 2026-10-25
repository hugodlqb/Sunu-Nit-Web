"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Person {
    id: string;
    name: string;
    surname: string;
    phone: string | null;
    country: string | null;
}

interface Role {
    id: string;
    key: string;
}

export default function AccountAdmin() {

    const { t } = useLanguage();
    const roleLabels: Record<string, string> = {
        admin: t.role_admin,
        editor: t.role_editor,
        volunteer: t.role_volunteer,
        volunteer_manager: t.role_volunteer_manager,
    };
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Person[]>([]);
    const [selectedPerson, setSelectedPerson] =
        useState<Person | null>(null);
    const { profile } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] =
        useState<string[]>([]);
    const [originalRoles, setOriginalRoles] =
        useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    async function searchUsers() {

        const value = search.trim();

        if (!value) {
            setResults([]);
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from("persons")
            .select("id, name, surname, phone, country")
            .or(
                `name.ilike.%${value}%,surname.ilike.%${value}%`
            )
            .limit(20);

        if (error) {

            console.error("Error buscando usuarios:", error);
            setResults([]);

        } else {

            setResults(data ?? []);

        }

        setLoading(false);
    }

    async function selectPerson(person: Person) {

        setSelectedPerson(person);

        // Obtener todos los roles disponibles
        const { data: allRoles, error: rolesError } =
            await supabase
                .from("roles")
                .select("id, key")
                .order("key");

        if (rolesError) {

            console.error(
                "Error cargando roles:",
                rolesError
            );

            return;
        }

        setRoles(allRoles ?? []);

        // Obtener los roles de esta persona
        const { data: personRoles, error: personRolesError } =
            await supabase
                .from("person_roles")
                .select("role_id")
                .eq("person_id", person.id);

        if (personRolesError) {

            console.error(
                "Error cargando roles del usuario:",
                personRolesError
            );

            return;
        }

        const roleIds =
            personRoles?.map(role => role.role_id) ?? [];

        setSelectedRoles(roleIds);
        setOriginalRoles(roleIds);
    }

    function toggleRole(roleId: string) {

        setSelectedRoles(current => {

            if (current.includes(roleId)) {

                return current.filter(
                    id => id !== roleId
                );

            }

            return [
                ...current,
                roleId
            ];

        });

    }

    async function saveRoles() {

        if (!selectedPerson) return;

        setSaving(true);

        const rolesToDelete =
            originalRoles.filter(
                roleId => !selectedRoles.includes(roleId)
            );

        const rolesToInsert =
            selectedRoles.filter(
                roleId => !originalRoles.includes(roleId)
            );

        if (rolesToDelete.length > 0) {

            const { error } = await supabase
                .from("person_roles")
                .delete()
                .eq("person_id", selectedPerson.id)
                .in("role_id", rolesToDelete);

            if (error) {

                console.error(
                    "Error eliminando roles:",
                    error
                );

                setSaving(false);
                return;
            }
        }

        if (rolesToInsert.length > 0) {

            const rows = rolesToInsert.map(roleId => ({
                person_id: selectedPerson.id,
                role_id: roleId
            }));

            const { error } = await supabase
                .from("person_roles")
                .insert(rows);

            if (error) {

                console.error(
                    "Error añadiendo roles:",
                    error
                );

                setSaving(false);
                return;
            }
        }

        setOriginalRoles(selectedRoles);
        setSaving(false);

        alert(t.admin_roles_saved);
    }

    return (

        <div>

            <h2>{t.admin_title}</h2>

            <div>

                <input
                    type="text"
                    placeholder={t.admin_search_placeholder}
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    onKeyDown={(e) => {

                        if (e.key === "Enter") {
                            searchUsers();
                        }

                    }}
                />

                <button onClick={searchUsers}>
                    {t.admin_search_button}
                </button>

            </div>

            {loading && (
                <p>{t.admin_searching}</p>
            )}

            {results.map(person => (

                <button
                    key={person.id}
                    onClick={() =>
                        selectPerson(person)
                    }
                >

                    <strong>
                        {person.name} {person.surname}
                    </strong>

                    <div>
                        {t.admin_phone}: {person.phone || "—"}
                    </div>

                    <div>
                        {t.admin_country}: {person.country || "—"}
                    </div>

                </button>

            ))}

            {selectedPerson && (

                <div>

                    <hr />

                    <h3>
                        {selectedPerson.name}{" "}
                        {selectedPerson.surname}
                    </h3>

                    <h4>
                        {t.admin_roles}
                    </h4>

                    {roles
                        .filter(role =>
                            !(role.key === "admin" &&
                                selectedPerson?.id === profile?.id)
                        )
                        .map(role => (

                            <label key={role.id}>

                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(
                                        role.id
                                    )}
                                    onChange={() =>
                                        toggleRole(role.id)
                                    }
                                />

                                {roleLabels[role.key] ?? role.key}

                            </label>

                        ))}

                    <button
                        onClick={saveRoles}
                        disabled={saving}
                    >
                        {saving ? t.admin_saving_roles : t.admin_save_roles}
                    </button>

                </div>

            )}

        </div>

    );
}