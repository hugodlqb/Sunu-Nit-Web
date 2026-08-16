"use client";

import "@/styles/collaborate.css";
import { useLanguage } from "@/context/LanguageContext";
import DonationCardsGrid from "@/components/ui/Collaborate/DonationCardsGrid";
import HelpButton from "@/components/ui/Collaborate/HelpButton";
import HelpPanel from "@/components/ui/Collaborate/HelpPanel";
import { animateHelpButton } from "@/components/ui/Collaborate/HelpAnimation";
import PaymentMethods from "@/components/ui/Collaborate/PaymentMethods";
import TransparencyAlert from "@/components/ui/Collaborate/TransparencyAlert";
import { useCollaborate } from "@/components/hooks/useCollaborate";
import { useDonationHelp } from "@/components/hooks/useDonationHelp";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";
import ProjectDonationCards from "@/components/ui/Collaborate/ProjectDonationCards";
import DonationFlow from "@/components/ui/Collaborate/DonationFlow";

export default function Collaborate() {

  const { t } = useLanguage();

  const {

    selectedDonation,
    amount,
    setAmount,
    isMonthly,
    setIsMonthly,
    showHelpPanel,
    setShowHelpPanel,
    confirmedAmounts,
    updateConfirmedAmount,
    closeDonation,
    currentDonation,
    calculatedUnits,

    donationOrigin,
    openThematicDonation,
    openProjectDonation,
    openFreeDonation

  } = useCollaborate();

  const {
    showHelpButton,
    deleteConfirmation,
    setDeleteConfirmation,
    addToHelp,
    removeFromHelp,
    confirmDeleteHelp,
    helpSummary,
    totalMonthly

  } = useDonationHelp(t);

  const impactText = currentDonation
    ? `${calculatedUnits} ${t[`don_${selectedDonation}_unit`]}`
    : "";

  useLockBodyScroll(
    !!selectedDonation ||
    showHelpPanel ||
    !!deleteConfirmation
  );

  return (
    <section
      className="section collaborate-section"
      id="collaborate"
    >
      {showHelpButton && (

        <HelpButton

          onClick={() =>
            setShowHelpPanel(prev => !prev)
          }

        />

      )}

      {showHelpPanel && (

        <HelpPanel

          onClose={() =>
            setShowHelpPanel(false)
          }

          helpSummary={helpSummary}

          totalMonthly={totalMonthly}

          isMonthly={isMonthly}

          setIsMonthly={setIsMonthly}

          removeFromHelp={removeFromHelp}

          addToHelp={addToHelp}

          deleteConfirmation={deleteConfirmation}

          setDeleteConfirmation={setDeleteConfirmation}

          confirmDeleteHelp={confirmDeleteHelp}

        />

      )}

      <div className="container">


        <div className="section-header">

          <h2>
            {t.collab_title}
          </h2>

          <p className="section-subtitle">
            {t.collab_subtitle}
          </p>

        </div>

        <DonationCardsGrid

          confirmedAmounts={confirmedAmounts}

          updateConfirmedAmount={updateConfirmedAmount}

          onAddToHelp={addToHelp}

          onDonateNow={openThematicDonation}

          animateHelpButton={animateHelpButton}

        />

        <ProjectDonationCards
          onDonate={openProjectDonation}
        />

        <PaymentMethods />

        <TransparencyAlert />

        {
          donationOrigin && (

            <DonationFlow

              origin={donationOrigin}

              amount={amount}

              setAmount={setAmount}

              isMonthly={isMonthly}

              setIsMonthly={setIsMonthly}

              close={closeDonation}

              onContinue={() => {

                console.log(
                  "Continuar donación:",
                  donationOrigin
                );

              }}

            />

          )
        }



      </div>

    </section>


  );

}