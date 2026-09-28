"use client";

import AccountStatistics from "@/components/ui/Account/AccountStatistics";
import AccountProjects from "@/components/ui/Account/My Activity/AccountProjects";
import AccountDonations from "@/components/ui/Account/My Activity/AccountDonations";

export default function AccountActivity() {
    return (
        <div className="account-activity">

            <div className="account-activity-top">
                <section className="account-activity-statistics">
                    <AccountStatistics />
                </section>

                <section className="account-activity-projects">
                    <AccountProjects />
                </section>
            </div>

            <section className="account-activity-donations">
                <AccountDonations />
            </section>

        </div>
    );
}