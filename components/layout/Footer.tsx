"use client";

import Link from "next/link";
import {
  EnvelopeSimple,
  Phone,
  InstagramLogo,
  TiktokLogo,
  FacebookLogo,
  CreditCard,
  Bank,
  GoogleLogo
} from "@phosphor-icons/react/dist/ssr";
import "@/styles/footer.css";
import { useLanguage } from "@/context/LanguageContext";


export default function Footer() {

  const { t } = useLanguage();

  return (

    <footer className="footer" id="contact">

      <div className="container footer-grid">


        {/* Información asociación */}
        <div className="footer-info">

          <div className="footer-logo">

            <span className="footer-logo-su">
              Su
            </span>
            <span className="footer-logo-nu">
              nu
            </span>
            <span className="footer-logo-nit">
              Nit
            </span>

          </div>


          <p className="footer-desc mt-1">
            {t.footer_desc}.
          </p>

        </div>



        {/* Contacto */}
        <div className="footer-contact">

          <h4>
            {t.footer_legal_title}
          </h4>


          <div className="contact-item">

            <EnvelopeSimple size={24} />

            <a href="mailto:info@asociacionsanoe.org">
              info@asociacionsanoe.org
            </a>

          </div>


          <div className="contact-item">

            <Phone size={24} />

            <span>
              +34 608 70 97 10
            </span>

          </div>



          <div className="social-links mt-2">

            <a
              href="https://www.instagram.com/mi_cuenta/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramLogo size={32} />
            </a>


            <a
              href="https://www.tiktok.com/@mi_cuenta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <TiktokLogo size={32} />
            </a>


            <a
              href="https://www.facebook.com/@mi_cuenta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookLogo size={32} />
            </a>

          </div>

        </div>




        {/* Información legal */}
        <div className="footer-legal">

          <h4>            {t.footer_legal_title}          </h4>
          <p>{t.footer_cif}</p>
          <p>{t.footer_registry}</p>
          <p>{t.footer_address}</p>



          <div className="payment-icons mt-1">

            <CreditCard size={32} />

            <Bank size={32} />

            <GoogleLogo size={32} />

          </div>


        </div>


      </div>



      <div className="footer-bottom">

        <div className="container">

          <p>© 2026 Asociación Sunu Nit. {t.footer_rights}</p>

        </div>

      </div>


    </footer>

  );

}