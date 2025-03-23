import { Router } from "express";
import { createOrderController } from "../controllers/order.controller";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.post("/", asyncHandler(createOrderController));

export default router;
