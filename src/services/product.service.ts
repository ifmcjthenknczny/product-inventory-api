import { Product } from "../types/product.type";

import ProductModel from "../models/product.model";
import { UpdateStockBody, UpdateStockQuery } from "../controllers/product.controller";

export const getAllProducts = async () => {
    return await ProductModel.find<Product>();
};

export const createProduct = async (product: Omit<Product, "_id">): Promise<Product> => {
    return await ProductModel.create<Product>(product);
};

export const restockProduct = async (id: UpdateStockQuery["id"], quantity: UpdateStockBody["quantity"]) => {
    return await ProductModel.findByIdAndUpdate<Product>(id, { $inc: { stock: quantity } }, { new: true });
};

export const sellProduct = async (id: UpdateStockQuery["id"], quantity: UpdateStockBody["quantity"]) => {
    const product = await ProductModel.findById<Product>(id);
    if (!product || product.stock < quantity) {
        throw new Error("Insufficient stock");
    }
    return await ProductModel.findByIdAndUpdate<Product>(id, { $inc: { stock: -quantity } }, { new: true });
};
