import { Product } from "../types/product.type";

import ProductModel from "../models/product.model";

export const getAllProducts = async () => await ProductModel.find();

export const createProduct = async (data: Product) => {
  if (data.price <= 0) {
	throw new Error("Price must be positive");
  }
  return await ProductModel.create(data);
};

export const restockProduct = async (id: string, amount: number) => {
  return await ProductModel.findByIdAndUpdate(id, { $inc: { stock: amount } }, { new: true });
};

export const sellProduct = async (id: string, amount: number) => {
  const product = await ProductModel.findById(id);
  if (!product || product.stock < amount) {
	throw new Error("Insufficient stock");
  }
  return await ProductModel.findByIdAndUpdate(id, { $inc: { stock: -amount } }, { new: true });
};
