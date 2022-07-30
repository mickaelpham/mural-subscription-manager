import express from "express";
import createWorkspace from "../../operations/create-workspace";
import billingAddress from "./billing-address";
import subscription from "./subscription";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, billingEmail } = req.body;
  const workspace = await createWorkspace({ name, billingEmail });
  res.status(201).json(workspace);
});

router.use(billingAddress);
router.use(subscription);

export default router;
