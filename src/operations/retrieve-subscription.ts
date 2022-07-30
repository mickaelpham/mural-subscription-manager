import { Workspace } from "@prisma/client";
import stripe from "../stripe";
import Subscription, {
  buildSubscriptionFromStripe,
} from "../types/subscription";

const retrieveSubscription = async (
  workspace: Workspace
): Promise<Subscription> => {
  const { externalId } = workspace;

  if (!externalId)
    throw new Error("Workspace is not associated with a customer");

  const customer = await stripe.customers.retrieve(externalId, {
    expand: ["subscriptions"],
  });

  if (customer.deleted) throw new Error("Deleted customer");

  if (!customer.subscriptions || customer.subscriptions.data.length === 0)
    throw new Error("Customer has no subscriptions");

  return buildSubscriptionFromStripe(customer.subscriptions.data[0]);
};

export default retrieveSubscription;
