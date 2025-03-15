import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import { OrderItem, Order } from "../types/order.type";
import { Product } from "../types/product.type";
import { determineSeason } from "../utils/holiday";
import { calculateProductPriceCoefficient, determinePriceModifiers } from "../utils/price";
import { sellProduct } from "./product.service";
import { toDay } from "../utils/date";
import { chunkify } from "../utils/array";
import { getCustomer } from "./customer.service";

const JOB_CHUNK_MAX_SIZE = 10;

export const createOrder = async (customerId: number, products: OrderItem[]): Promise<void> => {
    const date = new Date();
    let totalAmount = 0;

    const customer = await getCustomer(customerId);

    const dbOrderProducts: Order["products"] = [];
    const season = determineSeason(toDay(date));

    for (const orderProduct of products) {
        // TODO: find many products
        const product = await ProductModel.findById<Product>(orderProduct.productId);
        if (!product) {
            throw new Error(`Product of id ${orderProduct.productId} is unavailable`);
        }
        if (product.stock < orderProduct.quantity) {
            throw new Error(`Insufficient stock of product id ${orderProduct.productId}`);
        }

        const priceModifiers = determinePriceModifiers({ location: customer.location, productQuantity: orderProduct.quantity, season });
        const priceCoefficient = calculateProductPriceCoefficient(priceModifiers);
        const unitPrice = Math.ceil(priceCoefficient * product.price);

        dbOrderProducts.push({ ...orderProduct, unitPrice, unitPriceBeforeModifiers: product.price, priceModifiers });
        totalAmount += orderProduct.quantity * unitPrice;
    }

    const sellProductChunks = chunkify(
        products.map((product) => sellProduct(product.productId, product.quantity)),
        JOB_CHUNK_MAX_SIZE,
    );

    for (const chunk of sellProductChunks) {
        // TODO: dodać pole reserved
        await Promise.all(chunk);
    }

    await OrderModel.create({ customerId, products: dbOrderProducts, totalAmount, createdAt: date });
};
