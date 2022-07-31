import express from "express";
import Stripe from "stripe";
import downgradeToFreemium from "../../operations/downgrade-to-freemium";
import synchronizeSubscription from "../../operations/synchronize-subscription";
import stripe from "../../stripe";

const router = express.Router();

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
if (!endpointSecret)
  throw new Error("missing STRIPE_ENDPOINT_SECRET environment variable");

router.post("/stripe", async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  if (typeof sig !== "string") return res.sendStatus(400);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    const error = err as Stripe.errors.StripeError;
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case "customer.subscription.updated":
        await synchronizeSubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await downgradeToFreemium(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default router;
