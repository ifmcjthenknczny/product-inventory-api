import { Router, Request, Response } from "express";
import { createOrder } from "../services/order.service";

const router = Router();

interface CreateOrderBody {
  customerId: string;
  products: { productId: string; quantity: number }[];
}

// TODO: new type for req.body.products parameter, same case as in order.service.ts

router.post(
  "/",
  async (req: Request<{}, {}, CreateOrderBody>, res: Response) => {
    res.json(await createOrder(req.body.customerId, req.body.products));
  }
);

export default router;
