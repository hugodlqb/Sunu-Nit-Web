"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function CancelPage() {
  const { t } = useLanguage();
  return (
    <div className="container section">
      <h1>{t.donation_cancel_title}</h1>
      <p>{t.donation_cancel_message}</p>
    </div>
  )
}
