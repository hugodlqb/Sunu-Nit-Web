"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {

    user: User | null;
    profile: any | null;

    login: (
        email: string,
        password: string
    ) => Promise<string | null>;

    logout: () => Promise<void>;

}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children
}: {
    children: React.ReactNode;
}) {

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);

    async function loadProfile(userId: string) {

        const { data, error } = await supabase
            .from("persons")
            .select("*")
            .eq("auth_user_id", userId)
            .maybeSingle();

        if (error) {

            console.error("Error cargando perfil:", error);

            setProfile(null);

            return;

        }

        if (!data) {

            console.warn("Perfil no encontrado para usuario:", userId);
            setProfile(null);
            return;

        }

        setProfile(data);

    }

    useEffect(() => {


        async function loadUser() {

            const { data, error } = await supabase.auth.getUser();

            if (error) {

                console.error("Error fetching authenticated user:", error);
                setUser(null);
                setProfile(null);
                return;

            }

            const user = data?.user ?? null;

            setUser(user);

            if (user) {

                await loadProfile(user.id);

            }
        }


        loadUser();


        const {
            data: {
                subscription
            }

        } = supabase.auth.onAuthStateChange(

            async (_event, session) => {

                if (session?.user) {

                    setUser(session.user);

                    await loadProfile(session.user.id);

                } else {

                    setUser(null);
                    setProfile(null);

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

        const {
            error
        } = await supabase.auth.signInWithPassword({

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

    return (

        <AuthContext.Provider
            value={{
                user,
                profile,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth debe usarse dentro de AuthProvider"
        );

    }

    return context;

}