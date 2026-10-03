"use client";

import { useState } from "react";
import AccountActivity from "@/components/ui/Account/My Activity/AccountActivity";
import AccountSidebar from "@/components/ui/Account/AccountSidebar";
import AccountProfile from "@/components/ui/Account/AccountProfile";
import AccountSettings from "@/components/ui/Account/AccountSettings";
import ProjectManager from "@/components/ui/Account/Editor/ProjectManager";
import { AccountSection } from "./AccountTypes";
import "@/styles/account.css";
import AccountAdmin from "@/components/ui/Account/AccountAdmin";
import { useCollaborate } from "@/components/hooks/useCollaborate";
import DonationFlow from "@/components/ui/Collaborate/DonationFlow";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";

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
    const collaborate = useCollaborate();

    useLockBodyScroll(
        !!collaborate.donationOrigin
    );

    const [activeSection, setActiveSection] =
        useState<AccountSection>(
            initialSection || "profile"
        );

    function renderContent() {


        switch (activeSection) {


            case "profile":

                return <AccountProfile />;

            case "activity":

                return (
                    <AccountActivity
                        onDonate={
                            collaborate.openProjectDonation
                        }
                    />
                );

            case "settings":

                return <AccountSettings />;

            case "volunteer":

                return <div>Voluntariado - Próximamente</div>;

            case "volunteer_manager":

                return <div>Gestión de voluntarios - Próximamente</div>;

            case "editor":
                return <ProjectManager />;

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

            {collaborate.donationOrigin && (
                <DonationFlow
                    origin={collaborate.donationOrigin}
                    amount={collaborate.amount}
                    setAmount={collaborate.setAmount}
                    isMonthly={collaborate.isMonthly}
                    setIsMonthly={collaborate.setIsMonthly}
                    close={collaborate.closeDonation}
                    onContinue={
                        collaborate.continueDonation
                    }
                />
            )}

        </div>

    );


}