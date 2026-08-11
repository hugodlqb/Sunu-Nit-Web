import { donations } from "@/data/donations";

export function useHelpSummary(
  helpCart: Record<keyof typeof donations, number>,
  t: any
) {

  const helpSummary = Object.entries(helpCart)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => {

      const donation =
        donations[key as keyof typeof donations];


      const quantity =
        Math.floor(
          amount / donation.price * donation.units
        );


      return {
        id: key,
        title: t[`don_${key}_title`],
        quantity,
        unit: t[`don_${key}_unit`],
        amount,
      };

    });


  const totalMonthly =
    helpSummary.reduce(
      (sum, item) => sum + item.amount,
      0
    );


  return {
    helpSummary,
    totalMonthly
  };

}