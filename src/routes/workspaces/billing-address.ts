import express from "express";
import database from "../../database";
import editBillingAddress from "../../operations/edit-billing-address";
import retrieveBillingAddress from "../../operations/retrieve-billing-address";

const router = express.Router();

router.post("/:workspaceId/billing-address", async (req, res) => {
  const { line1, line2, city, state, postalCode, country } = req.body;
  const id = Number.parseInt(req.params.workspaceId);

  const workspace = await database.workspace.findUnique({ where: { id } });
  if (!workspace) return res.sendStatus(404);

  const updatedAddress = await editBillingAddress(workspace, {
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
  });

  res.json(updatedAddress);
});

router.get("/:workspaceId/billing-address", async (req, res) => {
  const id = Number.parseInt(req.params.workspaceId);

  const workspace = await database.workspace.findUnique({ where: { id } });
  if (!workspace) return res.sendStatus(404);

  res.json(await retrieveBillingAddress(workspace));
});

export default router;
