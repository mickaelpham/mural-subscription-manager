import express from "express";
import stripe from "./stripe";

const router = express.Router();

router.use(stripe);

export default router;
