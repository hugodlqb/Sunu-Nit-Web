"use client";

import { useAuth } from "@/context/AuthContext";
import {
    User,
    ChartBar,
    HandHeart,
    Gear,
    Folder
} from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import { AccountSection } from "./AccountTypes";


interface Props {

    activeSection: string;


    setActiveSection:
    (section: any) => void;


}



export default function AccountSidebar({

    activeSection,
    setActiveSection

}: Props) {


    const { t } = useLanguage();
    const { hasRole } = useAuth();
    const items: {
        id: AccountSection;
        label: string;
        icon: React.ReactNode;
    }[] = [

            {
                id: "profile",
                label: t.account_profile,
                icon: <User size={22} />
            },

            {
                id: "activity",
                label: t.account_activity,
                icon: <HandHeart size={22} />
            },

            {
                id: "settings",
                label: t.account_settings,
                icon: <Gear size={22} />
            },

            ...(hasRole("volunteer")
                ? [{
                    id: "volunteer" as AccountSection,
                    label: t.account_volunteering,
                    icon: <HandHeart size={22} />
                }]
                : []),

            ...(hasRole("volunteer_manager")
                ? [{
                    id: "volunteer_manager" as AccountSection,
                    label: t.account_volunteer_management,
                    icon: <User size={22} />
                }]
                : []),

            ...(hasRole("editor")
                ? [{
                    id: "editor" as AccountSection,
                    label: t.account_editor,
                    icon: <ChartBar size={22} />
                }]
                : []),

            ...(hasRole("admin")
                ? [{
                    id: "admin" as AccountSection,
                    label: t.account_administration,
                    icon: <Gear size={22} />
                }]
                : []),
        ];



    return (


        <aside className="account-sidebar">


            {
                items.map(item => (


                    <button

                        key={item.id}

                        className={
                            activeSection === item.id
                                ?
                                "active"
                                :
                                ""
                        }

                        onClick={() =>
                            setActiveSection(item.id)
                        }

                    >

                        {item.icon}

                        <span>
                            {item.label}
                        </span>


                    </button>


                ))
            }



        </aside>


    );


}