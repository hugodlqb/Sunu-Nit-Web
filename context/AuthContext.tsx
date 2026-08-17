"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

export interface PersonProfile {
    id: string;
    auth_user_id: string;
    name: string | null;
    surname: string | null;
    phone: string | null;
    country: string | null;
    preferred_language: string | null;
    created_at: string;
    accepted_communications: boolean | null;
}

interface ProfileUpdate {
    name: string;
    surname: string;
    phone: string;
    country: string;
    preferred_language: string;
    accepted_communications: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: PersonProfile | null;
    roles: string[];
    hasRole: (role: string) => boolean;

    login: (
        email: string,
        password: string
    ) => Promise<string | null>;

    logout: () => Promise<void>;

    updateProfile: (
        updates: ProfileUpdate
    ) => Promise<string | null>;
}

const AuthContext =
    createContext<AuthContextType | null>(null);

export function AuthProvider({
    children
}: {
    children: React.ReactNode;
}) {

    const [user, setUser] =
        useState<User | null>(null);

    const [profile, setProfile] =
        useState<PersonProfile | null>(null);

    const [roles, setRoles] =
        useState<string[]>([]);

    const { setLanguage } =
        useLanguage();


    async function loadRoles(
        personId: string
    ) {

        const { data, error } =
            await supabase
                .from("person_roles")
                .select(`
                    roles (
                        key
                    )
                `)
                .eq(
                    "person_id",
                    personId
                );

        if (error) {

            console.error(
                "Error cargando roles:",
                error
            );

            setRoles([]);

            return;
        }

        const userRoles =
            data
                ?.map(
                    (item: any) =>
                        item.roles?.key
                )
                .filter(Boolean) ?? [];

        setRoles(userRoles);
    }


    async function loadProfile(
        userId: string
    ) {

        const { data, error } =
            await supabase
                .from("persons")
                .select("*")
                .eq(
                    "auth_user_id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error cargando perfil:",
                error
            );

            setProfile(null);
            setRoles([]);

            return;
        }


        if (!data) {

            console.warn(
                "Perfil no encontrado para usuario:",
                userId
            );

            setProfile(null);
            setRoles([]);

            return;
        }


        // ==========================
        // PERFIL
        // ==========================

        setProfile(
            data as PersonProfile
        );


        // ==========================
        // IDIOMA PREFERIDO
        // ==========================

        const preferredLanguage =
            data.preferred_language;

        if (
            preferredLanguage === "es" ||
            preferredLanguage === "en" ||
            preferredLanguage === "fr"
        ) {

            setLanguage(
                preferredLanguage
            );

        }


        // ==========================
        // ROLES
        // ==========================

        await loadRoles(
            data.id
        );

    }


    async function updateProfile(
        updates: ProfileUpdate
    ): Promise<string | null> {

        if (!user || !profile) {

            return (
                "No hay ningún usuario autenticado."
            );

        }


        const { data, error } =
            await supabase
                .from("persons")
                .update({

                    name:
                        updates.name,

                    surname:
                        updates.surname,

                    phone:
                        updates.phone,

                    country:
                        updates.country,

                    preferred_language:
                        updates.preferred_language,

                    accepted_communications:
                        updates.accepted_communications

                })
                .eq(
                    "id",
                    profile.id
                )
                .eq(
                    "auth_user_id",
                    user.id
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Error actualizando perfil:",
                error
            );

            return error.message;
        }


        setProfile(
            data as PersonProfile
        );


        // Si el usuario cambia el idioma
        // desde Perfil, también actualizamos
        // inmediatamente la interfaz.

        const preferredLanguage =
            data.preferred_language;

        if (
            preferredLanguage === "es" ||
            preferredLanguage === "en" ||
            preferredLanguage === "fr"
        ) {

            setLanguage(
                preferredLanguage
            );

        }


        return null;
    }


    useEffect(() => {

        async function loadUser() {

            const {
                data: {
                    session
                }
            } =
                await supabase.auth.getSession();


            const currentUser =
                session?.user ?? null;


            setUser(
                currentUser
            );


            if (currentUser) {

                await loadProfile(
                    currentUser.id
                );

            } else {

                setProfile(null);
                setRoles([]);

            }

        }


        loadUser();


        const {
            data: {
                subscription
            }
        } =
            supabase.auth.onAuthStateChange(
                async (
                    _event,
                    session
                ) => {

                    if (session?.user) {

                        setUser(
                            session.user
                        );

                        await loadProfile(
                            session.user.id
                        );

                    } else {

                        setUser(null);
                        setProfile(null);
                        setRoles([]);

                        // Volvemos al idioma
                        // predeterminado al cerrar sesión.

                        setLanguage("es");

                    }

                }
            );


        return () => {

            subscription.unsubscribe();

        };

    }, []);


    async function login(
        email: string,
        password: string
    ) {

        const { error } =
            await supabase.auth
                .signInWithPassword({

                    email,
                    password

                });


        if (error) {

            return error.message;

        }


        return null;
    }


    async function logout() {

        await supabase.auth.signOut();

    }


    function hasRole(
        role: string
    ) {

        return roles.includes(
            role
        );

    }


    return (

        <AuthContext.Provider
            value={{

                user,
                profile,
                roles,

                hasRole,

                login,
                logout,

                updateProfile

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth debe usarse dentro de AuthProvider"
        );

    }


    return context;

}