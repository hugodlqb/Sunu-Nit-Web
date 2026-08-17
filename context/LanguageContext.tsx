"use client";

import {
  createContext,
  useContext,
  useState
} from "react";

import { translations } from "@/i18n/translations";

type Language = "es" | "en" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
}

const LanguageContext =
  createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [language, setLanguageState] =
    useState<Language>("es");

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {

  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage debe usarse dentro de LanguageProvider"
    );
  }

  return context;
}