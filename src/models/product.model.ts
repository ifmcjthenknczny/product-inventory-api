import { Schema, models, model, Model } from "mongoose";
import { Product } from "../types/product.type";

const productSchema = new Schema<Product>(
    {
        _id: { type: Number },
        name: { type: String, required: true, maxlength: 50 },
        description: { type: String, required: true, maxlength: 50 },
        unitPrice: { type: Number, required: true, min: 1 }, // in cents
        stock: { type: Number, required: true, min: 0 },
        reservedStock: [
            {
                orderId: { type: String, required: true },
                quantity: { type: Number, required: true, min: 0 },
            },
        ],
    },
    { timestamps: true, strict: true, versionKey: false },
);

const ProductModel: Model<Product> = models.product || model<Product>("product", productSchema);

export default ProductModel;
