import {Request, Response, Router} from "express";
import { getAllProducts, createProduct, restockProduct, sellProduct } from "../services/product.service";

const router = Router();

interface ProductParams {
    id: string;
  }
  
  interface RestockSellBody {
    amount: number;
  }
  
  interface CreateProductBody {
    name: string;
    description: string;
    price: number;
    stock: number;
  }
  
  router.get("/", async (_, res: Response) => {
    res.json(await getAllProducts());
  });
  
  router.post(
    "/",
    async (req: Request<{}, {}, CreateProductBody>, res: Response) => {
      res.json(await createProduct(req.body));
    }
  );
  
  router.post(
    "/:id/restock",
    async (req: Request<ProductParams, {}, RestockSellBody>, res: Response) => {
      res.json(await restockProduct(req.params.id, req.body.amount));
    }
  );
  
  router.post(
    "/:id/sell",
    async (req: Request<ProductParams, {}, RestockSellBody>, res: Response) => {
      res.json(await sellProduct(req.params.id, req.body.amount));
    }
  );
  
  export default router;