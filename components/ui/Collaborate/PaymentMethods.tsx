"use client";

import {
  DeviceMobile,
  Bank,
  Copy,
} from "@phosphor-icons/react/dist/ssr";

import { useLanguage } from "@/context/LanguageContext";


export default function PaymentMethods() {

  const { t } = useLanguage();


  return (

    <div className="collaborate-grid grid-2 container-sm">


      <div className="collab-card highlighted-card">


        <div className="collab-badge-wrapper">

          <div className="collab-badge">

            {t.collab_badge_fast}

          </div>

        </div>



        <DeviceMobile size={45} />


        <h3>
          {t.collab_bizum_title}
        </h3>



        <div className="bizum-number">


          <span>
            +34 608 70 97 10
          </span>


          <button
            className="btn-copy"
            title={t.copied}
          >

            <Copy size={28} />

          </button>


        </div>


        <p className="small-text text-muted">
          {t.collab_bizum_desc}
        </p>



      </div>




      <div className="collab-card">


        <Bank size={45} />


        <h3>
          {t.collab_transfer_title}
        </h3>



        <p className="collab-transfer-desc">
          {t.collab_transfer_desc}
        </p>



        <button className="btn btn-outline w-100">

          {t.btn_request_iban}

        </button>


      </div>



    </div>

  );

}
