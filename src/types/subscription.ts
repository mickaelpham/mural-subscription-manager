import Stripe from "stripe";
import { stripeTimeToDate } from "../stripe";

enum SubscriptionPlan {
  TEAM_PLUS = "team+",
  BUSINESS = "business",
}

enum BillingPeriod {
  MONTHLY = "monthly",
  ANNUAL = "annual",
}

interface Subscription {
  plan: SubscriptionPlan;
  memberships: number;
  billingPeriod: BillingPeriod;
  nextInvoice: Date;
  cancelAtPeriodEnd: boolean;
}

const TEAM_PLUS_MONTHLY_PRICE = "price_1LRK1xA6xZrKb1gYIe5uQU0S";
const TEAM_PLUS_ANNUAL_PRICE = "price_1LRK1xA6xZrKb1gYfcmArOaR";
const BUSINESS_ANNUAL_PRICE = "price_1LRK2QA6xZrKb1gYJo7652B2";

export const retrievePrice = (
  plan: SubscriptionPlan,
  billingPeriod: BillingPeriod
): string => {
  switch (plan) {
    case SubscriptionPlan.TEAM_PLUS:
      return billingPeriod === BillingPeriod.MONTHLY
        ? TEAM_PLUS_MONTHLY_PRICE
        : TEAM_PLUS_ANNUAL_PRICE;
    case SubscriptionPlan.BUSINESS:
      if (billingPeriod !== BillingPeriod.ANNUAL)
        throw new Error("invalid billing period for business plan");
      return BUSINESS_ANNUAL_PRICE;
    default:
      throw new Error("unknown subscription plan");
  }
};

const retrieveSubscriptionPlan = (price: string): SubscriptionPlan => {
  switch (price) {
    case TEAM_PLUS_MONTHLY_PRICE:
      return SubscriptionPlan.TEAM_PLUS;
    case TEAM_PLUS_ANNUAL_PRICE:
      return SubscriptionPlan.TEAM_PLUS;
    case BUSINESS_ANNUAL_PRICE:
      return SubscriptionPlan.BUSINESS;
    default:
      throw new Error("unknown subscription plan from Stripe price");
  }
};

const retrieveBillingPeriod = (price: string): BillingPeriod => {
  switch (price) {
    case TEAM_PLUS_MONTHLY_PRICE:
      return BillingPeriod.MONTHLY;
    case TEAM_PLUS_ANNUAL_PRICE:
      return BillingPeriod.ANNUAL;
    case BUSINESS_ANNUAL_PRICE:
      return BillingPeriod.ANNUAL;
    default:
      throw new Error("unknown billing period from Stripe price");
  }
};

export const buildSubscriptionFromStripe = (
  stripeSubscription: Stripe.Subscription
): Subscription => {
  const item = stripeSubscription.items.data[0];
  if (!item.quantity)
    throw new Error("subscription item does not have a quantity");

  return {
    plan: retrieveSubscriptionPlan(item.price.id),
    memberships: item.quantity,
    billingPeriod: retrieveBillingPeriod(item.price.id),
    nextInvoice: stripeTimeToDate(stripeSubscription.current_period_end),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  };
};

export default Subscription;
