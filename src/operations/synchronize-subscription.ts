import Stripe from "stripe";
import database from "../database";
import { buildSubscriptionFromStripe } from "../types/subscription";

const synchronizeSubscription = (stripeSubscription: Stripe.Subscription) =>
  database.subscription.update({
    where: { externalId: stripeSubscription.id },
    data: buildSubscriptionFromStripe(stripeSubscription),
  });

export default synchronizeSubscription;
