"use client";

import {
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

import { useLanguage } from "@/context/LanguageContext";


export default function TransparencyAlert() {

  const { t } = useLanguage();


  return (

    <div
      className="alert mx-auto mt-4"
      style={{ paddingTop: "25px" }}
    >

      <WarningCircle size={62} />


      <p>

        <strong>
          {t.warning_strong}
        </strong>

        {" "}

        {t.transparency_warning}

      </p>


    </div>

  );

}