import express from "express";
import database from "../../database";
import editSubscription from "../../operations/edit-subscription";
import previewInvoice from "../../operations/preview-invoice";
import retrieveSubscription from "../../operations/retrieve-subscription";

const router = express.Router();

router.get("/:workspaceId/subscription", async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.workspaceId);

    const workspace = await database.workspace.findUnique({ where: { id } });
    if (!workspace) return res.sendStatus(404);

    res.json(await retrieveSubscription(workspace));
  } catch (error) {
    next(error);
  }
});

router.post("/:workspaceId/subscription", async (req, res, next) => {
  try {
    const { plan, memberships, billingPeriod } = req.body;
    const id = Number.parseInt(req.params.workspaceId);

    const workspace = await database.workspace.findUnique({ where: { id } });
    if (!workspace) return res.sendStatus(404);

    const updatedSubscription = await editSubscription(workspace, {
      plan,
      memberships,
      billingPeriod,
    });

    res.json(updatedSubscription);
  } catch (error) {
    next(error);
  }
});

router.post("/:workspaceId/subscription/preview", async (req, res, next) => {
  try {
    const { plan, memberships, billingPeriod } = req.body;
    const id = Number.parseInt(req.params.workspaceId);

    const workspace = await database.workspace.findUnique({ where: { id } });
    if (!workspace) return res.sendStatus(404);

    const updatedSubscription = await previewInvoice(workspace, {
      plan,
      memberships,
      billingPeriod,
    });

    res.json(updatedSubscription);
  } catch (error) {
    next(error);
  }
});

export default router;
