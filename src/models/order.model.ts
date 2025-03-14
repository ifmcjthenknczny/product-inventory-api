import { Schema, model, models } from "mongoose";
import { Order } from "../types/order.type";

const orderModel = new Schema<Order>(
    {
        customerId: { type: Number, required: true },
        products: [
            {
                productId: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
                unitPrice: { type: Number, required: true, min: 0 },
                unitPriceBeforeDiscount: { type: Number, min: 0 },
            },
        ],
        totalAmount: { type: Number, required: true, min: 0 },
    },
    { timestamps: true, strict: true },
);

export default models.Order<Order> || model<Order>("Order", orderModel);
