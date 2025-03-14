import Joi from "joi";

export const priceSchema = Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER);

export const quantitySchema = Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER);

export const idSchema = Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER);
