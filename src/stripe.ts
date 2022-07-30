import { Stripe } from "stripe";

const apiKey = process.env.STRIPE_API_KEY;
if (!apiKey) throw new Error("missing STRIPE_API_KEY environment variable");

export const stripeTimeToDate = (d: number) => new Date(d * 1_000);

export default new Stripe(apiKey, { apiVersion: "2020-08-27" });
