/**
 * Public bank-transfer details.
 *
 * These values are intentionally empty until the association's bank account
 * is confirmed. NEXT_PUBLIC_* values are public and must never contain secrets.
 */
export const donationConfig = {
  iban: (process.env.NEXT_PUBLIC_DONATION_IBAN ?? "").replace(/\s/g, "").toUpperCase(),
  bankName: (process.env.NEXT_PUBLIC_DONATION_BANK_NAME ?? "").trim(),
};
