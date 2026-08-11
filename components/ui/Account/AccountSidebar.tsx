"use client";


import {
    User,
    ChartBar,
    HandHeart,
    Gear
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
                id: "statistics",
                label: t.account_statistics,
                icon: <ChartBar size={22} />
            },


            {
                id: "donations",
                label: t.account_donations,
                icon: <HandHeart size={22} />
            },


            {
                id: "settings",
                label: t.account_settings,
                icon: <Gear size={22} />
            },


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