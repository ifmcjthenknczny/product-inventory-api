import Joi from "joi"

export const priceSchema = Joi.number().integer().positive()
// TODO: rename schema below and this file
export const quantitySchema = Joi.number().integer().positive()

export const idSchema = Joi.number().integer().positive()