import { Workspace } from "@prisma/client";
import database from "../database";
import stripe, { dateToStripeTime } from "../stripe";

interface CreateWorkspaceParams {
  name: string;
  billingEmail: string;
}

const createWorkspace = async (
  params: CreateWorkspaceParams
): Promise<Workspace> => {
  const { name, billingEmail: email } = params;

  // create a test clock
  const testClock = await stripe.testHelpers.testClocks.create({
    frozen_time: dateToStripeTime(new Date("2020-01-01T11:00:00Z")),
  });

  // create the Stripe customer
  const customer = await stripe.customers.create({
    name,
    email,
    test_clock: testClock.id,
  });

  // persist the workspace in the database
  const workspace = await database.workspace.create({
    data: { name, billingEmail: email, externalId: customer.id },
  });

  return workspace;
};

export default createWorkspace;
