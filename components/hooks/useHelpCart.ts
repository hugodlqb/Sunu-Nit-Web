"use client";

import { useState } from "react";
import { donations } from "@/data/donations";


export function useHelpCart() {


  const [helpCart, setHelpCart] =
    useState<Record<keyof typeof donations, number>>({
      food: 0,
      hygiene: 0,
      health: 0,
    });


  const [showHelpButton, setShowHelpButton] =
    useState(false);


  const [deleteConfirmation, setDeleteConfirmation] =
    useState<keyof typeof donations | null>(null);



  function addToHelp(
    type: keyof typeof donations,
    value: number
  ) {

    setHelpCart(prev => ({
      ...prev,
      [type]: prev[type] + value,
    }));

    setShowHelpButton(true);
  }



  function removeFromHelp(
    type: keyof typeof donations
  ) {

    const donation = donations[type];


    setHelpCart(prev => {

      const newValue =
        prev[type] - donation.price;


      if (newValue <= 0) {

        setDeleteConfirmation(type);

        return prev;

      }


      return {
        ...prev,
        [type]: newValue,
      };

    });

  }

  function updateHelpAmount(
    type: keyof typeof donations,
    value: number
  ) {
    setHelpCart(prev => ({
      ...prev,
      [type]: Math.max(0, value),
    }));

    if (value > 0) {
      setShowHelpButton(true);
    }
  }

  function confirmDeleteHelp() {

    if (!deleteConfirmation) return;


    setHelpCart(prev => {

      const updatedCart = {
        ...prev,
        [deleteConfirmation]: 0,
      };


      const hasItems =
        Object.values(updatedCart)
          .some(value => value > 0);



      if (!hasItems) {

        setShowHelpButton(false);

      }


      return updatedCart;

    });


    setDeleteConfirmation(null);

  }

  return {
    helpCart,
    showHelpButton,
    deleteConfirmation,
    setDeleteConfirmation,
    addToHelp,
    removeFromHelp,
    updateHelpAmount,
    confirmDeleteHelp,
  };

}