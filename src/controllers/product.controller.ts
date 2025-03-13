import { Request, Response } from "express";
import validateSchema from "../utils/validate";
import { createProduct, getAllProducts, restockProduct, sellProduct } from "../services/product.service";
import { Product } from "../types/product.type";
import { createProductSchema, updateProductStockBodySchema, updateProductStockQuerySchema } from "../schema/product.schema";
import { Item } from "../types/order.type";

export type UpdateStockQuery = {
    id: number;
};

export type UpdateStockBody = {
    quantity: number;
};

export const getAllProductsController = async (req: Request, res: Response) => {
    res.json(await getAllProducts());
};

export const createProductController = async (req: Request, res: Response) => {
    const product = validateSchema<Omit<Product, "_id">>(req.body, createProductSchema);
    res.status(201).json(await createProduct(product));
};

export const restockProductController = async (req: Request, res: Response) => {
    const { id } = validateSchema<UpdateStockQuery>(req.query, updateProductStockQuerySchema);
    const { quantity } = validateSchema<UpdateStockBody>(req.body, updateProductStockBodySchema);

    const updatedProduct = await restockProduct(id, quantity);
    res.json(updatedProduct)
};

export const sellProductController = async (req: Request, res: Response) => {
    const { id } = validateSchema<UpdateStockQuery>(req.query, updateProductStockQuerySchema);
    const { quantity } = validateSchema<UpdateStockBody>(req.body, updateProductStockBodySchema);

    const updatedProduct = await sellProduct(id, quantity);
    res.json(updatedProduct)
};