import {
  BowlFood,
  Drop,
  FirstAid,
} from "@phosphor-icons/react/dist/ssr";

export const donations = {

  food: {
    id: "food",
    icon: BowlFood,
    color: "accent",

    defaultAmount: 15,
    min: 5,
    max: 25,
    step: 5,

    price: 5,
    units: 1,
  },

  hygiene: {
    id: "hygiene",
    icon: Drop,
    color: "primary",

    defaultAmount: 20,
    min: 10,
    max: 50,
    step: 10,

    price: 10,
    units: 1,
  },

  health: {
    id: "health",
    icon: FirstAid,
    color: "secondary",

    defaultAmount: 25,
    min: 25,
    max: 125,
    step: 25,

    price: 25,
    units: 1,
  },

};