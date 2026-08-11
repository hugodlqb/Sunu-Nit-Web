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
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: typeof translations.es;
}


const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
} | null>(null);


export function LanguageProvider({
  children
}: {
  children: React.ReactNode
}) {


  const [language, setLanguage] = useState<Language>("es");


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


export function useLanguage(){

  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  }

  return context;

}