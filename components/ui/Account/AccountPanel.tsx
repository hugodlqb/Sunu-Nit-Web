"use client";

import { useState } from "react";

import AccountSidebar from "@/components/ui/Account/AccountSidebar";
import AccountProfile from "@/components/ui/Account/AccountProfile";
import AccountStatistics from "@/components/ui/Account/AccountStatistics";
import AccountDonations from "@/components/ui/Account/AccountDonations";
import AccountSettings from "@/components/ui/Account/AccountSettings";
import { AccountSection } from "./AccountTypes";
import "@/styles/account.css";
import AccountAdmin from "@/components/ui/Account/AccountAdmin";

interface Props {

    onClose: () => void;

    initialSection?: AccountSection;

    closing?: boolean;

}

export default function AccountPanel({

    onClose,
    initialSection,
    closing

}: Props) {


    const [activeSection, setActiveSection] =
        useState<AccountSection>(
            initialSection || "profile"
        );

    function renderContent() {


        switch (activeSection) {


            case "profile":

                return <AccountProfile />;


            case "statistics":

                return <AccountStatistics />;


            case "donations":

                return <AccountDonations />;


            case "settings":

                return <AccountSettings />;

            case "volunteer":

                return <div>Voluntariado - Próximamente</div>;

            case "volunteer_manager":

                return <div>Gestión de voluntarios - Próximamente</div>;

            case "editor":

                return <div>Editor - Próximamente</div>;

            case "admin":

                return <AccountAdmin />;

            default:

                return <AccountProfile />;

        }


    }



    return (
        <div
            className={
                closing
                    ? "account-panel closing"
                    : "account-panel"
            }
        >


            <header className="account-header">


                <button

                    className="account-close"

                    onClick={onClose}

                >

                    ←

                </button>



                <h2>
                    Mi cuenta
                </h2>


            </header>



            <div className="account-body">


                <AccountSidebar

                    activeSection={activeSection}

                    setActiveSection={setActiveSection}

                />



                <main className="account-content">

                    {renderContent()}

                </main>


            </div>



        </div>

    );


}