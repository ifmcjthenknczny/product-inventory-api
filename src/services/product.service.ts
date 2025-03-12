import { Product } from "../types/product.type";

import ProductModel from "../models/product.model";

export const getAllProducts = async () => {
    return await ProductModel.find<Product>();
}

export const createProduct = async (data: Omit<Product, '_id'>) => {
    // TODO: schema
    if (data.price <= 0) {
        throw new Error("Price must be positive");
    }
    return await ProductModel.create<Product>(data);
};

export const restockProduct = async (id: string, amount: number) => {
    // TODO: amount > 0
    return await ProductModel.findByIdAndUpdate<Product>(id, { $inc: { stock: amount } }, { new: true });
};

export const sellProduct = async (id: string, amount: number) => {
    // TODO: amount > 0
    const product = await ProductModel.findById<Product>(id);
    if (!product || product.stock < amount) {
        throw new Error("Insufficient stock");
    }
    return await ProductModel.findByIdAndUpdate<Product>(id, { $inc: { stock: -amount } }, { new: true });
};
