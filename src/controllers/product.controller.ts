import { Request, Response } from "express";
import validateSchema from "../utils/validate";
import { createProduct, getAllProducts, restockProduct, sellProduct } from "../services/product.service";
import { Product } from "../types/product.type";
import { createProductSchema, updateProductStockBodySchema, updateProductStockQuerySchema } from "../schema/product.schema";

export type UpdateStockQuery = {
    id: number;
};

export type UpdateStockBody = {
    quantity: number;
};

export type CreateProduct = Omit<Product, "_id" | "reservedStock">;

export const getAllProductsController = async (req: Request, res: Response) => {
    const products = await getAllProducts();
    res.status(200).json(products);
};

export const createProductController = async (req: Request, res: Response) => {
    const product = validateSchema<CreateProduct>(req.body, createProductSchema);
    await createProduct(product);
    res.status(201).json({ message: "Product created successfully" });
};

export const restockProductController = async (req: Request, res: Response) => {
    const { id } = validateSchema<UpdateStockQuery>(req.params, updateProductStockQuerySchema);
    const { quantity } = validateSchema<UpdateStockBody>(req.body, updateProductStockBodySchema);

    await restockProduct(id, quantity);
    res.status(200).json({ message: "Product restocked successfully" });
};

export const sellProductController = async (req: Request, res: Response) => {
    // In current implementation (with reservedStock) it is reccomended to drop this endpoint - without orderId as a parameter it may lead to inconsistencies.
    const { id } = validateSchema<UpdateStockQuery>(req.params, updateProductStockQuerySchema);
    const { quantity } = validateSchema<UpdateStockBody>(req.body, updateProductStockBodySchema);

    await sellProduct(id, quantity);
    res.status(200).json({ message: "Product sold successfully" });
};
