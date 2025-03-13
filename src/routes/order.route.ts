import { Router } from "express";
import { createOrderController } from "../controllers/order.controller";

const router = Router();

router.post(
  "/",
  createOrderController
);

export default router;
