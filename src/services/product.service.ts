import { Product, PublicProduct, ReservedStock } from "../types/product.type";

import { CreateProduct, UpdateStockBody, UpdateStockQuery } from "../controllers/product.controller";
import { fromCents, toCents } from "../utils/price";
import { omit } from "../utils/common";
import { OrderItem } from "../types/order.type";
import { chunkify } from "../utils/array";
import ProductModel from "../models/product.model";
import { findNextId } from "../utils/db";

const MAX_ASYNC_CHUNK_SIZE = 20;

export type ProductLookupObject = Record<string, Omit<Product, "_id">>;

const toDbCreateProduct = async (product: CreateProduct): Promise<Omit<Product, "reservedStock">> => {
    return {
        ...product,
        _id: await findNextId(ProductModel),
        unitPrice: toCents(product.unitPrice),
    };
};

const toPublicProduct = (product: Product): PublicProduct => {
    return {
        ...omit(product, ["reservedStock"]),
        unitPrice: fromCents(product.unitPrice),
    };
};

export const getAllProducts = async () => {
    // TODO: implementing pagination should be a good idea here
    const products = await ProductModel.find<Product>().lean<Product[]>();
    return products.map(toPublicProduct);
};

export const createProduct = async (product: CreateProduct): Promise<void> => {
    const dbProduct = await toDbCreateProduct(product);
    await ProductModel.create<CreateProduct>(dbProduct);
};

export const restockProduct = async (productId: UpdateStockQuery["id"], quantity: UpdateStockBody["quantity"]): Promise<void> => {
    await ProductModel.findByIdAndUpdate<Product>(productId, { $inc: { stock: quantity } }, { new: true });
};

const hasEnoughStock = (orderProduct: OrderItem, product: Omit<Product, "_id">, orderId?: string) => {
    const reservedStock = product.reservedStock || [];
    const reservedQuantity = reservedStock.reduce((sum: number, r: ReservedStock) => sum + r.quantity, 0);
    if (reservedQuantity > product.stock) {
        throw new Error("Concurrency error");
    }

    const reservedStockForOrderId = orderId ? reservedStock.find((r) => r.orderId === orderId)?.quantity || 0 : 0;

    if (reservedStockForOrderId >= orderProduct.quantity) {
        return true;
    }

    const availableStock = product.stock - reservedQuantity;
    return availableStock >= orderProduct.quantity;
};

export const sellProduct = async (productId: UpdateStockQuery["id"], quantity: UpdateStockBody["quantity"], orderId?: string) => {
    const product = await ProductModel.findById<Product>(productId).lean<Product>();
    if (!product) {
        throw new Error(`Product with ID ${productId} is unavailable`);
    }
    if (!hasEnoughStock({ productId, quantity }, product, orderId)) {
        throw new Error(`Insufficient stock for product id ${productId}`);
    }

    await ProductModel.findByIdAndUpdate<Product>(productId, { $inc: { stock: -quantity } }, { new: true });
};

export const getProductsByIdAsLookupObject = async (productIds: Product["_id"][]): Promise<ProductLookupObject> => {
    // Retrieves multiple products from the database and optimizes lookup efficiency
    const dbProducts = await ProductModel.find<Product>({ _id: { $in: productIds } }, { unitPrice: 1, stock: 1, reservedStock: 1 }).lean<Product[]>();

    const productObject = Object.fromEntries(dbProducts.map((p) => [p._id.toString(), omit(p, ["_id"])]));

    return productObject;
};

export const dropProductsReservationsForOrderId = async (orderId: string) => {
    await ProductModel.updateMany({ "reservedStock.orderId": orderId }, { $pull: { reservedStock: { orderId } } });
};

export const reserveStock = async (orderId: string, orderProducts: OrderItem[]) => {
    const products = await getProductsByIdAsLookupObject(orderProducts.map((product) => product.productId));

    for (const orderProduct of orderProducts) {
        const product = products[orderProduct.productId];
        if (!product) {
            await dropProductsReservationsForOrderId(orderId);
            throw new Error(`Product with ID ${orderProduct.productId} is unavailable`);
        }
        if (!hasEnoughStock(orderProduct, product, orderId)) {
            await dropProductsReservationsForOrderId(orderId);
            throw new Error(`Insufficient stock for product id ${orderProduct.productId}`);
        }

        await ProductModel.updateOne({ _id: orderProduct.productId }, { $push: { reservedStock: { orderId, quantity: orderProduct.quantity } } });
    }
};

export const rollbackSellProducts = async (rollbackOrderProducts: OrderItem[]) => {
    const jobChunks = chunkify(
        rollbackOrderProducts.map((orderProduct) => {
            ProductModel.updateOne({ _id: orderProduct.productId }, { $inc: { stock: { $inc: orderProduct.quantity } } });
        }),
        MAX_ASYNC_CHUNK_SIZE,
    );

    for (const chunk of jobChunks) {
        await Promise.all(chunk);
    }
};
