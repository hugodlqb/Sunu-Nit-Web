"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { images } from "@/data/images";
import AppImage from "@/components/ui/AppImage";
import RegisterModal from "@/components/ui/Auth/RegisterModal";
import { useAuth } from "@/context/AuthContext";
import AccountPanel from "@/components/ui/Account/AccountPanel";
import LanguageSelector from "@/components/ui/LanguageSelector";
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
import { usePathname } from "next/navigation";
import LoginForm from "@/components/ui/Auth/LoginForm";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";

type AccountSection =
  | "profile"
  | "activity"
  | "settings"
  | "volunteer"
  | "volunteer_manager"
  | "editor"
  | "admin";

interface Props {
  accountOpen: boolean;
  onOpenAccount: () => void;
  onCloseAccount: () => void;
}

export default function Header({
  accountOpen,
  onOpenAccount,
  onCloseAccount,
}: Props) {

  const [userOpen, setUserOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const pathname = usePathname();

  const sectionHref = (section: string) =>
    pathname === "/" ? `#${section}` : `/#${section}`;

  const {
    user,
    profile,
    hasRole,
    logout
  } = useAuth();

  const {
    t
  } = useLanguage();

  const [closingAccount, setClosingAccount] = useState(false);

  const [accountSection, setAccountSection] =
    useState<AccountSection>("profile");

  const goToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    section: string
  ) => {
    e.preventDefault();

    setUserOpen(false);

    onCloseAccount();

    if (pathname === "/") {
      document
        .getElementById(section)
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }

    window.location.href = `/#${section}`;
  };

  const openAccount = (section: AccountSection) => {
    setAccountSection(section);

    onOpenAccount();

    setUserOpen(false);
  };

  const closeAccount = () => {
    onCloseAccount();
  };

  useLockBodyScroll(
    userOpen ||
    accountOpen
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

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

  useEffect(() => {
    const handleCloseOverlays = () => {
      setUserOpen(false);
      onCloseAccount();
    };

    window.addEventListener(
      "close-navigation-overlays",
      handleCloseOverlays
    );

    return () => {
      window.removeEventListener(
        "close-navigation-overlays",
        handleCloseOverlays
      );
    };
  }, [onCloseAccount]);

  return (
    <header className="header">

      <div className="container header-content">

        <AppImage
          image={images.logo}
          className="header-logo"
        />

        <nav className="nav">

          <a
            href={sectionHref("hero")}
            className={activeSection === "hero" ? "active" : ""}
            onClick={(e) => goToSection(e, "hero")}
          >
            {t.nav_home}
          </a>

          <a
            href={sectionHref("about")}
            className={activeSection === "about" ? "active" : ""}
            onClick={(e) => goToSection(e, "about")}
          >
            {t.nav_about}
          </a>

          <a
            href={sectionHref("impact")}
            className={activeSection === "impact" ? "active" : ""}
            onClick={(e) => goToSection(e, "impact")}
          >
            {t.nav_transparency}
          </a>

          <a
            href={sectionHref("activities")}
            className={activeSection === "activities" ? "active" : ""}
            onClick={(e) => goToSection(e, "activities")}
          >
            {t.nav_activities}
          </a>

          <a
            href={sectionHref("news")}
            className={activeSection === "news" ? "active" : ""}
            onClick={(e) => goToSection(e, "news")}
          >
            {t.nav_news}
          </a>

          <a
            href={sectionHref("collaborate")}
            onClick={(e) => goToSection(e, "collaborate")}
          >
            {t.btn_donate_main}
          </a>

          <a
            href={sectionHref("contact")}
            className={activeSection === "contact" ? "active" : ""}
            onClick={(e) => goToSection(e, "contact")}
          >
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
                            openAccount("activity")
                          }
                        >
                          <HandHeart size={20} />
                          <span>Mi actividad</span>
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

                        {
                          hasRole("admin") && (
                            <button
                              className="user-menu-option"
                              onClick={() => {
                                openAccount("admin");
                              }}
                            >
                              <Gear size={20} />
                              <span>Administración</span>
                            </button>
                          )
                        }

                        {
                          hasRole("volunteer") && (
                            <button
                              className="user-menu-option"
                              onClick={() => {
                                openAccount("volunteer");
                              }}
                            >
                              <HandHeart size={20} />
                              <span>Voluntariado</span>
                            </button>
                          )
                        }

                        {
                          hasRole("volunteer_manager") && (
                            <button
                              className="user-menu-option"
                              onClick={() => {
                                openAccount("volunteer_manager");
                              }}
                            >
                              <User size={20} />
                              <span>Gestión de voluntarios</span>
                            </button>
                          )
                        }

                        {
                          hasRole("editor") && (
                            <button
                              className="user-menu-option"
                              onClick={() => {
                                openAccount("editor");
                              }}
                            >
                              <ChartBar size={20} />
                              <span>Editor</span>
                            </button>
                          )
                        }

                        <hr />

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

                          <span>
                            {t.login_no_account}
                          </span>

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

          <LanguageSelector />

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