import { Workspace } from "@prisma/client";
import stripe from "../stripe";
import BillingAddress, { buildBillingAddress } from "../types/billing-address";

const retrieveBillingAddress = async (
  workspace: Workspace
): Promise<BillingAddress> => {
  const { externalId: customer } = workspace;
  if (!customer) throw new Error("Workspace is not associated with a customer");

  const retrievedCustomer = await stripe.customers.retrieve(customer);
  if (retrievedCustomer.deleted) throw new Error("Deleted customer");

  return buildBillingAddress(retrievedCustomer);
};

export default retrieveBillingAddress;
