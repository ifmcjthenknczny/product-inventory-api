import { Router } from "express";
import {
    createProductController,
    getAllProductsController,
    restockProductController,
    sellProductController,
} from "../controllers/product.controller";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getAllProductsController));
router.post("/", asyncHandler(createProductController));
router.post("/:id/restock", asyncHandler(restockProductController));
router.post("/:id/sell", asyncHandler(sellProductController));

export default router;
