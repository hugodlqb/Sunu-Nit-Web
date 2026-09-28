"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function LanguageSelector() {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const {
    language,
    setLanguage
  } = useLanguage();

  const {
    user,
    profile,
    updatePreferredLanguage
  } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        langRef.current &&
        !langRef.current.contains(target)
      ) {
        setLangOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLanguageChange(
    newLanguage: "es" | "en" | "fr"
  ) {

    setLangOpen(false);

    if (!user || !profile) {

      setLanguage(
        newLanguage
      );

      return;
    }

    const error =
      await updatePreferredLanguage(
        newLanguage
      );

    if (error) {

      console.error(
        "No se pudo guardar el idioma preferido:",
        error
      );

    }

  }

  return (
    <div
      className="lang-selector"
      ref={langRef}
    >
      <button
        className="lang-btn"
        onClick={() => setLangOpen(!langOpen)}
      >
        {language.toUpperCase()} ▾
      </button>

      {langOpen && (
        <div className="lang-menu">

          <button
            className="lang-option"
            onClick={() =>
              handleLanguageChange("es")
            }
          >
            Español
          </button>

          <button
            className="lang-option"
            onClick={() =>
              handleLanguageChange("en")
            }
          >
            English
          </button>

          <button
            className="lang-option"
            onClick={() =>
              handleLanguageChange("fr")
            }
          >
            Français
          </button>

        </div>
      )}
    </div>
  );
}