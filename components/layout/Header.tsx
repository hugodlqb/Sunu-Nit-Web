"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { images } from "@/data/images";
import AppImage from "@/components/ui/AppImage";
import RegisterModal from "@/components/ui/Auth/RegisterModal";
import { useAuth } from "@/context/AuthContext";
import AccountPanel from "@/components/ui/Account/AccountPanel";
import {
  UserCircle,
  List,
  User,
  ChartBar,
  HandHeart,
  Gear,
  SignOut
} from "@phosphor-icons/react/dist/ssr";
import "@/styles/header.css";
import LoginForm from "@/components/ui/Auth/LoginForm";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";

export default function Header() {

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [userOpen, setUserOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [loginError, setLoginError] = useState("");
  const {
    user,
    profile,
    logout
  } = useAuth();
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const [accountOpen, setAccountOpen] = useState(false);
  const [closingAccount, setClosingAccount] = useState(false);
  const [accountSection, setAccountSection] =
    useState<
      "profile" |
      "statistics" |
      "donations" |
      "settings"
    >("profile");

  const openAccount = (
    section:
      | "profile"
      | "statistics"
      | "donations"
      | "settings"
  ) => {

    setAccountSection(section);

    setAccountOpen(true);

    setUserOpen(false);

  };

  const goToCollaborate = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {

    e.preventDefault();

    // cerrar menú usuario
    setUserOpen(false);

    // cerrar panel cuenta si estuviera abierto
    setAccountOpen(false);

    // cerrar idiomas por seguridad
    setLangOpen(false);


    setTimeout(() => {

      document
        .getElementById("collaborate")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }, 50);

  };
  const closeAccount = () => {
    setAccountOpen(false);
  };

  useLockBodyScroll(
    userOpen ||
    langOpen ||
    accountOpen
  );

  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      const target = event.target as Node;

      if (
        langRef.current &&
        !langRef.current.contains(target)
      ) {
        setLangOpen(false);
      }


      if (
        userRef.current &&
        !userRef.current.contains(target)
      ) {
        setUserOpen(false);
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
  useEffect(() => {

    const sections = [
      "hero",
      "about",
      "impact",
      "news",
      "activities",
      "collaborate",
      "contact"
    ];

    const observer = new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            setActiveSection(entry.target.id);

          }

        });

      },

      {
        threshold: .5
      }

    );


    sections.forEach(id => {

      const section = document.getElementById(id);

      if (section) {
        observer.observe(section);
      }

    });


    return () => observer.disconnect();


  }, []);
  return (
    <header className="header">

      <div className="container header-content">

        <AppImage
          image={images.logo}
          className="header-logo"
        />

        <nav className="nav">


          <a
            href="#hero"
            className={activeSection === "hero" ? "active" : ""}
          >
            {t.nav_home}
          </a>


          <a href="#about"
            className={activeSection === "about" ? "active" : ""}>
            {t.nav_about}
          </a>


          <a href="#impact"
            className={activeSection === "impact" ? "active" : ""}>
            {t.nav_transparency}
          </a>

          <a
            href="#activities"
            className={activeSection === "activities" ? "active" : ""}
          >
            {t.nav_activities}
          </a>

          <a href="#news"
            className={activeSection === "news" ? "active" : ""}>
            {t.nav_news}
          </a>

          <a
            href="#collaborate"
            onClick={goToCollaborate}
          >
            {t.btn_donate_main}
          </a>

          <a href="#contact"
            className={activeSection === "contact" ? "active" : ""}>
            {t.nav_contact}
          </a>


        </nav>

        <div className="header-actions">

          <div
            className="user-menu-container"
            ref={userRef}
          >

            <button
              className="user-btn"
              onClick={() => setUserOpen(!userOpen)}
            >

              <UserCircle size={28} />
              <span>
                {
                  profile
                    ?
                    profile.name
                    :
                    t.btn_login
                }
              </span>

            </button>

            {
              userOpen && (

                <div className="user-popover">


                  {
                    user ? (

                      <>

                        <h4>
                          {t.user_hello} {profile?.name || user.email}
                        </h4>

                        <hr />

                        <button
                          className="user-menu-option"
                          onClick={() =>
                            openAccount("profile")
                          }
                        >
                          <User size={20} />
                          <span>{t.account_profile}</span>
                        </button>

                        <button
                          className="user-menu-option"
                          onClick={() =>
                            openAccount("statistics")
                          }
                        >
                          <User size={20} />
                          <span>{t.account_statistics}</span>
                        </button>

                        <button
                          className="user-menu-option"
                          onClick={() =>
                            openAccount("donations")
                          }
                        >
                          <User size={20} />
                          <span>{t.account_donations}</span>
                        </button>

                        <button
                          className="user-menu-option"
                          onClick={() =>
                            openAccount("settings")
                          }
                        >
                          <Gear size={20} />
                          <span>{t.account_settings}</span>
                        </button>
                        <hr />

                        <button
                          className="btn btn-primary w-100"
                          onClick={async () => {
                            await logout();
                            setUserOpen(false);
                          }}
                        >
                          <span>{t.user_logout}</span>
                          <SignOut size={20} />
                        </button>


                      </>


                    ) : (

                      <>

                        <h4>
                          {t.login_title}
                        </h4>


                        <LoginForm
                          onSuccess={() => {
                            setUserOpen(false);
                          }}
                        />


                        <div className="user-register">
                          <span>{t.login_no_account}</span>
                          <button
                            onClick={() => {
                              setUserOpen(false);
                              setRegisterOpen(true);
                            }}
                          >
                            {t.login_register}
                          </button>


                        </div>


                      </>

                    )

                  }


                </div>

              )
            }

          </div>

          {/* IDIOMAS */}

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
                  onClick={() => {
                    setLanguage("es");
                    setLangOpen(false);
                  }}
                >
                  Español
                </button>



                <button
                  className="lang-option"
                  onClick={() => {
                    setLanguage("en");
                    setLangOpen(false);
                  }}
                >
                  English
                </button>



                <button
                  className="lang-option"
                  onClick={() => {
                    setLanguage("fr");
                    setLangOpen(false);
                  }}
                >
                  Français
                </button>


              </div>

            )}

          </div>


          <button className="mobile-toggle">

            <List size={28} />

          </button>


        </div>


      </div>
      {
        registerOpen && (

          <RegisterModal

            onClose={() => setRegisterOpen(false)}

            onSuccess={() => {
              setUserOpen(false);
            }}

          />

        )
      }

      {
        accountOpen && (

          <AccountPanel

            initialSection={accountSection}

            onClose={closeAccount}

            closing={closingAccount}

          />

        )
      }

    </header>

  );

}