import express from "express";
import createWorkspace from "../operations/create-workspace";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, billingEmail } = req.body;
  const workspace = await createWorkspace({ name, billingEmail });
  res.status(201).json(workspace);
});

export default router;
