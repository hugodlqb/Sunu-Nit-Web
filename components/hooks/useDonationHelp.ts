"use client";

import { useHelpCart } from "./useHelpCart";
import { useHelpSummary } from "./useHelpSummary";


export function useDonationHelp(t: any) {

  const {
    helpCart,
    showHelpButton,
    deleteConfirmation,
    setDeleteConfirmation,
    addToHelp,
    removeFromHelp,
    updateHelpAmount,
    confirmDeleteHelp
  } = useHelpCart();

  const {
    helpSummary,
    totalMonthly

  } = useHelpSummary(
    helpCart,
    t
  );

  return {
    helpCart,
    showHelpButton,
    deleteConfirmation,
    setDeleteConfirmation,
    addToHelp,
    removeFromHelp,
    updateHelpAmount,
    confirmDeleteHelp,
    helpSummary,
    totalMonthly
  };

}