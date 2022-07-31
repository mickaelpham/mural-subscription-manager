import { Workspace } from "@prisma/client";
import Stripe from "stripe";
import stripe, { dateToStripeTime } from "../stripe";
import { retrievePrice } from "../types/subscription";
import { EditSubscriptionParams } from "./edit-subscription";

interface PreviewInvoiceResponse {
  amountDue: number;
  availableCredit: number;
}

const buildPreviewInvoiceResponse = (
  invoice: Stripe.Invoice,
  prorationDate?: number
): PreviewInvoiceResponse => {
  const now = prorationDate || dateToStripeTime(new Date());

  const amountDue = invoice.lines.data
    .filter((item) => item.period.start <= now)
    .reduce((total, item) => total + item.amount, 0);

  return {
    amountDue: amountDue / 100,
    availableCredit: invoice.starting_balance,
  };
};

const previewCreateSubscription = async (
  customer: string,
  subscription: EditSubscriptionParams
): Promise<PreviewInvoiceResponse> => {
  const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
    customer,
    subscription_items: [
      {
        quantity: subscription.memberships,
        price: retrievePrice(subscription.plan, subscription.billingPeriod),
      },
    ],
  });

  return buildPreviewInvoiceResponse(upcomingInvoice);
};

const previewUpdateSubscription = async (
  customer: Stripe.Customer,
  stripeSubscription: Stripe.Subscription,
  subscription: EditSubscriptionParams
): Promise<PreviewInvoiceResponse> => {
  const { test_clock: testClock } = customer;

  const prorationDate =
    testClock && typeof testClock !== "string"
      ? testClock.frozen_time
      : dateToStripeTime(new Date());

  const itemId = stripeSubscription.items.data[0].id;

  const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
    subscription: stripeSubscription.id,
    subscription_proration_date: prorationDate,
    subscription_items: [
      {
        id: itemId,
        quantity: subscription.memberships,
        price: retrievePrice(subscription.plan, subscription.billingPeriod),
      },
    ],
  });

  return buildPreviewInvoiceResponse(upcomingInvoice, prorationDate);
};

const previewInvoice = async (
  workspace: Workspace,
  subscription: EditSubscriptionParams
): Promise<PreviewInvoiceResponse> => {
  const { externalId } = workspace;

  if (!externalId)
    throw new Error("Workspace is not associated with a customer");

  const customer = await stripe.customers.retrieve(externalId, {
    expand: ["subscriptions", "test_clock"],
  });

  if (customer.deleted) throw new Error("Deleted customer");

  const maybeStripeSubscription = customer.subscriptions?.data[0];

  return maybeStripeSubscription
    ? previewUpdateSubscription(customer, maybeStripeSubscription, subscription)
    : previewCreateSubscription(customer.id, subscription);
};

export default previewInvoice;
