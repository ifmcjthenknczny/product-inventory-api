import { Request, Response } from "express";
import validateSchema from "../utils/validate";
import { OrderItem } from "../types/order.type";
import { createOrderSchema } from "../schema/order.schema";
import { processAndCreateOrder } from "../services/order.service";

export type CreateOrderBody = {
    customerId: number;
    products: OrderItem[];
};

export const createOrderController = async (req: Request, res: Response) => {
    const { customerId, products } = validateSchema<CreateOrderBody>(req.body, createOrderSchema);

    await processAndCreateOrder(customerId, products);
    res.status(201).json({ message: "Order created successfully" });
};
