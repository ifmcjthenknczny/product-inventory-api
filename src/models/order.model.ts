import { Schema, model, models } from "mongoose";
import { Order, PRICE_MODIFIER_TYPES } from "../types/order.type";

const orderModel = new Schema<Order>(
    {
        _id: { type: String, required: true },
        customerId: { type: Number, required: true },
        products: [
            {
                productId: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
                unitPrice: { type: Number, required: true, min: 0 },
                unitPriceBeforeModifiers: { type: Number, min: 0 },
                priceModifiers: [
                    {
                        name: { type: String, enum: PRICE_MODIFIER_TYPES, required: true },
                        modifierPercent: { type: Number, required: true }, // Percentage change, eg. -30
                    },
                ],
            },
        ],
        totalAmount: { type: Number, required: true, min: 0 },
    },
    { timestamps: true, strict: true, versionKey: false },
);

export default models.Order<Order> || model<Order>("Order", orderModel);
