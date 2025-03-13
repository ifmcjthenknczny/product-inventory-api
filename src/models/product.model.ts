import { Schema, models, model } from "mongoose";
import { Product } from "../types/product.type";

const productModel = new Schema<Product>({
    name: { type: String, required: true, maxlength: 50 },
    description: { type: String, required: true, maxLength: 50 },
    price: { type: Number, required: true, min: 1 }, // in cents
    stock: { type: Number, required: true, min: 0 },
});

export default models.product<Product> || model<Product>("product", productModel);
