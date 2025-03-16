import Joi from "joi";

// is significantly below MAX_SAFE_INTEGER / 128
export const priceSchema = Joi.number()
    .positive()
    .max(1_000_000_000_000)
    .custom((value: number, helpers) => {
        if (!Number.isInteger(value * 100)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "Precision validation")
    .messages({
        "any.invalid": "Price must have at most two decimal places.",
    });

export const quantitySchema = Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER);

export const idSchema = Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER);
