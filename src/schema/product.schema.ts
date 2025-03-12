import Joi from "joi";
import { idSchema, priceSchema, quantitySchema } from "./util";

export const createProductSchema = Joi.object({
    name: Joi.string().min(0).max(50).required(),
    description: Joi.string().min(0).max(50).required(),
    price: priceSchema.required(),
    stock: Joi.number().integer().required()
}).required()

export const restockProductSchema = Joi.object({
    id: idSchema.required(),
    amount: quantitySchema.required()
}).required()

export const sellProductSchema = Joi.object({
    id: idSchema.required(),
    amount: quantitySchema.required()
}).required()