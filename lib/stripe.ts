import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export const PLANS = {
  pro: {
    priceId: "price_YOUR_PRO_PRICE_ID",
    name: "Pro",
    amount: 1900,
  },
  team: {
    priceId: "price_YOUR_TEAM_PRICE_ID",
    name: "Team",
    amount: 4900,
  },
};