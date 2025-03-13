import Joi from "joi";
import { idSchema, priceSchema, quantitySchema } from "./common.schema";

export const createProductSchema = Joi.object({
    name: Joi.string().min(0).max(50).required(),
    description: Joi.string().min(0).max(50).required(),
    price: priceSchema.required(),
    stock: Joi.number().integer().required(),
}).required();

export const updateProductStockQuerySchema = Joi.object({
    id: idSchema.required(),
});

export const updateProductStockBodySchema = Joi.object({
    quantity: quantitySchema.required(),
});
