import Joi from "joi";
import { idSchema, priceSchema, quantitySchema } from "./common.schema";

export const createProductSchema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().min(1).max(50).required(),
    unitPrice: priceSchema.required(), // floating price
    stock: Joi.number().integer().min(0).required(),
}).required();

export const updateProductStockQuerySchema = Joi.object({
    id: idSchema.required(),
});

export const updateProductStockBodySchema = Joi.object({
    quantity: quantitySchema.required(),
});
