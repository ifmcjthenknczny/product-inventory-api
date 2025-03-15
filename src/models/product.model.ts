import { Schema, models, model } from "mongoose";
import { Product } from "../types/product.type";

const productModel = new Schema<Product>(
    {
        _id: { type: Number, required: true, min: 1 },
        name: { type: String, required: true, maxlength: 50 },
        description: { type: String, required: true, maxLength: 50 },
        unitPrice: { type: Number, required: true, min: 1 }, // in cents
        stock: { type: Number, required: true, min: 0 },
    },
    { timestamps: true, strict: true },
);

export default models.product<Product> || model<Product>("product", productModel);
