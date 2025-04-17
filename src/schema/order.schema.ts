import Joi from "joi";
import { idSchema, quantitySchema } from "./common.schema";

const orderProductSchema = Joi.object({
    productId: idSchema.required(),
    quantity: quantitySchema.required(),
});

const orderProductsSchema = Joi.array()
    .items(orderProductSchema.required())
    .min(1)
    .unique((a, b) => a.productId === b.productId);

export const createOrderSchema = Joi.object({
    customerId: idSchema.required(),
    products: orderProductsSchema.required(),
}).required();
