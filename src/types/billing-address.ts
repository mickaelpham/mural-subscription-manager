import Stripe from "stripe";

interface BillingAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

export const buildBillingAddress = ({
  address,
}: Stripe.Customer): BillingAddress => {
  if (!address) throw new Error("customer does not have an address");

  return {
    line1: address.line1 && address.line1.length > 0 ? address.line1 : null,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
  };
};

export default BillingAddress;
