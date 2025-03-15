import { Product } from "../types/product.type";

import ProductModel from "../models/product.model";
import { UpdateStockBody, UpdateStockQuery } from "../controllers/product.controller";
import { toCents } from "../utils/price";
import { omit } from "../utils/common";

export type ProductLookupMap = Record<string, Omit<Product, "_id">>;

const toDbProductInsert = (product: Omit<Product, "_id">): Omit<Product, "_id"> => {
    return {
        ...product,
        unitPrice: toCents(product.unitPrice),
    };
};

export const getAllProducts = async () => {
    return await ProductModel.find<Product>();
};

export const createProduct = async (product: Omit<Product, "_id">): Promise<void> => {
    await ProductModel.create<Product>(toDbProductInsert(product));
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

export const getProductsByIdAsLookupObject = async (productIds: Product["_id"][]): Promise<ProductLookupMap> => {
    // Retrieves multiple products from the database and optimizes lookup efficiency
    const dbProducts = await ProductModel.find<Product>({ _id: { $in: productIds } }, { unitPrice: 1, stock: 1 });

    const productObject = Object.fromEntries(dbProducts.map((p) => [p._id.toString(), omit(p, ["_id"])]));

    return productObject;
};
