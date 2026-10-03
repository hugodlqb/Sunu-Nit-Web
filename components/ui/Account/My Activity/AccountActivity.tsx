"use client";

import AccountStatistics from "@/components/ui/Account/AccountStatistics";
import AccountProjects from "@/components/ui/Account/My Activity/AccountProjects";
import AccountDonations from "@/components/ui/Account/My Activity/AccountDonations";

interface Props {
    onDonate: (
        projectId: string,
        projectName: string
    ) => void;
}

export default function AccountActivity({
    onDonate,
}: Props) {
    return (
        <div className="account-activity">

            <div className="account-activity-top">
                <section className="account-activity-statistics">
                    <AccountStatistics />
                </section>

                <section className="account-activity-projects">
                    <AccountProjects
                        onDonate={onDonate}
                    />
                </section>
            </div>

            <section className="account-activity-donations">
                <AccountDonations />
            </section>

        </div>
    );
}