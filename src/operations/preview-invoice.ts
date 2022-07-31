import { Workspace } from "@prisma/client";
import Stripe from "stripe";
import stripe, { dateToStripeTime, stripeTimeToDate } from "../stripe";
import { retrievePrice } from "../types/subscription";
import { EditSubscriptionParams } from "./edit-subscription";

interface PreviewInvoiceResponse {
  amountDue: number;
  availableCredit: number;
  discount?: {
    coupon: {
      name: string | null;
      amountOff: number | null;
      percentOff: number | null;
    };
    start: Date;
    end?: Date;
  };
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
    availableCredit: invoice.starting_balance / 100,
    discount: invoice.discount
      ? {
          coupon: {
            name: invoice.discount.coupon.name,
            amountOff: invoice.discount.coupon.amount_off
              ? invoice.discount.coupon.amount_off / 100
              : null,
            percentOff: invoice.discount.coupon.percent_off,
          },
          start: stripeTimeToDate(invoice.discount.start),
          end: invoice.discount.end
            ? stripeTimeToDate(invoice.discount.end)
            : undefined,
        }
      : undefined,
  };
};

const retrieveCoupon = async (
  promoCode?: string
): Promise<string | undefined> => {
  if (promoCode) {
    const promotions = await stripe.promotionCodes.list({ code: promoCode });

    if (promotions.data[0]) return promotions.data[0].coupon.id;
  }
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
    coupon: await retrieveCoupon(subscription.promoCode),
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
    coupon: await retrieveCoupon(subscription.promoCode),
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
