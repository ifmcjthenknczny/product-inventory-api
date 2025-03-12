import Joi from "joi";
import { idSchema, quantitySchema } from "./util";

const orderProductSchema = Joi.object({
    productId: idSchema.required(),
    quantity: quantitySchema.required()
})

const orderProductsSchema = Joi.array().items(orderProductSchema.required()).min(1);

export const createOrderSchema = Joi.object({
    customerId: idSchema.required(),
    products: orderProductsSchema.required()
}).required()