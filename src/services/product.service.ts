import { Product } from "../types/product.type";

import ProductModel from "../models/product.model";
import { UpdateStockBody, UpdateStockQuery } from "../controllers/product.controller";
import { toCents } from "../utils/price";

const toDbProduct = (product: Product): Product => {
    return {
        ...product,
        price: toCents(product.price),
    };
};

export const getAllProducts = async () => {
    return await ProductModel.find<Product>();
};

export const createProduct = async (product: Omit<Product, "_id">): Promise<void> => {
    await ProductModel.create<Product>(toDbProduct(product));
};

export const restockProduct = async (productId: UpdateStockQuery["id"], quantity: UpdateStockBody["quantity"]): Promise<void> => {
    await ProductModel.findByIdAndUpdate<Product>(productId, { $inc: { stock: quantity } }, { new: true });
};

export const sellProduct = async (productId: UpdateStockQuery["id"], quantity: UpdateStockBody["quantity"]) => {
    const product = await ProductModel.findById<Product>(productId);
    if (!product || product.stock < quantity) {
        throw new Error("Insufficient stock");
    }
    await ProductModel.findByIdAndUpdate<Product>(productId, { $inc: { stock: -quantity } }, { new: true });
};
