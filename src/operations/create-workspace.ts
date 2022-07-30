import { Workspace } from "@prisma/client";
import database from "../database";
import stripe from "../stripe";

interface CreateWorkspaceParams {
  name: string;
  billingEmail: string;
}

const createWorkspace = async (
  params: CreateWorkspaceParams
): Promise<Workspace> => {
  const { name, billingEmail: email } = params;

  // first create the Stripe customer
  const customer = await stripe.customers.create({ name, email });

  // then persist the workspace in the database
  const workspace = await database.workspace.create({
    data: { name, billingEmail: email, externalId: customer.id },
  });

  return workspace;
};

export default createWorkspace;
