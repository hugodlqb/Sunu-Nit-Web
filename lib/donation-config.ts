/**
 * Public bank-transfer details.
 * The IBAN fallback is a visibly marked example; replace it with the real IBAN
 * or set NEXT_PUBLIC_DONATION_IBAN when the association's account is ready.
 * NEXT_PUBLIC_* values are public and must never contain secrets.
 */
const exampleIban = "ES0000000000000000000000";
const configuredIban = (process.env.NEXT_PUBLIC_DONATION_IBAN ?? "").replace(/\s/g, "").toUpperCase();

export const donationConfig = {
  iban: configuredIban || exampleIban,
  isExampleIban: !configuredIban,
  bankName: (process.env.NEXT_PUBLIC_DONATION_BANK_NAME ?? "").trim(),
};
