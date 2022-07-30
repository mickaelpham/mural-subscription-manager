import { Workspace } from "@prisma/client";
import Stripe from "stripe";
import stripe from "../stripe";
import Subscription, {
  buildSubscriptionFromStripe,
  retrievePrice,
} from "../types/subscription";

const DAYS_UNTIL_DUE = 14; // days

const createSubscription = async (
  customer: string,
  subscription: EditSubsCriptionParams
): Promise<Subscription> => {
  const stripeSubscription = await stripe.subscriptions.create({
    customer,
    items: [
      {
        price: retrievePrice(subscription.plan, subscription.billingPeriod),
        quantity: subscription.memberships,
      },
    ],
    collection_method: "send_invoice",
    days_until_due: DAYS_UNTIL_DUE,
  });

  return buildSubscriptionFromStripe(stripeSubscription);
};

const updateSubscription = async (
  stripeSubscription: Stripe.Subscription,
  subscription: EditSubsCriptionParams
): Promise<Subscription> => {
  const itemId = stripeSubscription.items.data[0].id;

  const updatedStripeSubscription = await stripe.subscriptions.update(
    stripeSubscription.id,
    {
      items: [
        {
          id: itemId,
          price: retrievePrice(subscription.plan, subscription.billingPeriod),
          quantity: subscription.memberships,
        },
      ],
      proration_behavior: "always_invoice",
    }
  );

  return buildSubscriptionFromStripe(updatedStripeSubscription);
};

export type EditSubsCriptionParams = Pick<
  Subscription,
  "memberships" | "billingPeriod" | "plan"
>;

const editSubscription = async (
  workspace: Workspace,
  subscription: EditSubsCriptionParams
): Promise<Subscription> => {
  const { externalId } = workspace;

  if (!externalId)
    throw new Error("Workspace is not associated with a customer");

  const customer = await stripe.customers.retrieve(externalId, {
    expand: ["subscriptions"],
  });

  if (customer.deleted) throw new Error("Deleted customer");

  const maybeStripeSubscription = customer.subscriptions?.data[0];

  return maybeStripeSubscription
    ? updateSubscription(maybeStripeSubscription, subscription)
    : createSubscription(customer.id, subscription);
};

export default editSubscription;
