"use client";

import AccountStatistics from "@/components/ui/Account/AccountStatistics";
import AccountDonations from "@/components/ui/Account/AccountDonations";

export default function AccountActivity() {

    return (
        <div className="account-activity">

            <AccountStatistics />

            <AccountDonations />

        </div>
    );

}