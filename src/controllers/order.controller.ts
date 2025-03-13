import { Request, Response } from "express";
import validateSchema from "../utils/validate";
import { Item } from "../types/order.type";
import { createOrderSchema } from "../schema/order.schema";
import { createOrder } from "../services/order.service";

export type CreateOrderBody = {
    customerId: number;
    products: Item[];
};

export const createOrderController = async (req: Request, res: Response) => {
    const { customerId, products } = validateSchema<CreateOrderBody>(req.body, createOrderSchema);
    const order = await createOrder(customerId, products);
    res.status(201).json(order);
};
