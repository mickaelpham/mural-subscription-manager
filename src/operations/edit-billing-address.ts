import { Workspace } from "@prisma/client";
import stripe from "../stripe";
import BillingAddress, { buildBillingAddress } from "../types/billing-address";

const editBillingAddress = async (
  workspace: Workspace,
  address: BillingAddress
): Promise<BillingAddress> => {
  const { externalId: customer } = workspace;
  if (!customer) throw new Error("Workspace is not associated with a customer");

  const updatedCustomer = await stripe.customers.update(customer, {
    address: {
      line1: address.line1 || "",
      line2: address.line2 || undefined,
      city: address.city || undefined,
      postal_code: address.postalCode || undefined,
      state: address.state || undefined,
      country: address.country || undefined,
    },
  });

  return buildBillingAddress(updatedCustomer);
};

export default editBillingAddress;
