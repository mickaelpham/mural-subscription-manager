import { SubscriptionPlan } from "@prisma/client";
import Stripe from "stripe";
import database from "../database";

const downgradeToFreemium = (stripeSubscription: Stripe.Subscription) =>
  database.subscription.update({
    where: { externalId: stripeSubscription.id },
    data: {
      externalId: null,
      plan: SubscriptionPlan.FREEMIUM,
      billingPeriod: null,
      memberships: null,
      nextInvoice: null,
      cancelAtPeriodEnd: false,
    },
  });

export default downgradeToFreemium;
