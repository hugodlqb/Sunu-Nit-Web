"use client";

import { useState } from "react";
import { donations } from "@/data/donations";


export function useCollaborate() {


  const [selectedDonation, setSelectedDonation] =
    useState<keyof typeof donations | null>(null);


  const [amount, setAmount] =
    useState(25);



  const [isMonthly, setIsMonthly] =
    useState(true);



  const [showHelpPanel, setShowHelpPanel] =
    useState(false);



  const [confirmedAmounts, setConfirmedAmounts] =
    useState({

      food: donations.food.defaultAmount,

      hygiene: donations.hygiene.defaultAmount,

      health: donations.health.defaultAmount

    });



  function closeDonation() {

    setSelectedDonation(null);

  }



  function updateConfirmedAmount(
    type: keyof typeof donations,
    value:number
  ){

    setConfirmedAmounts(prev => ({

      ...prev,

      [type]: value

    }));

  }



  const currentDonation =
    selectedDonation
      ? donations[selectedDonation]
      : null;



  const calculatedUnits =
    currentDonation
      ? Math.floor(
          amount /
          currentDonation.price *
          currentDonation.units
        )
      : 0;



  return {

    selectedDonation,

    setSelectedDonation,

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

    calculatedUnits

  };

}