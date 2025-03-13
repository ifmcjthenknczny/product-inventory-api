import { Router } from "express";
import {
    createProductController,
    getAllProductsController,
    restockProductController,
    sellProductController,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getAllProductsController);
router.post("/", createProductController);
router.post("/:id/restock", restockProductController);
router.post("/:id/sell", sellProductController);

export default router;
