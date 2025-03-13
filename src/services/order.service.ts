import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import { Item, Order } from "../types/order.type";
import { Product } from "../types/product.type";
import { determineSeason } from "../utils/holiday";
import { calculateProductPriceCoefficient } from "../utils/price";
import { sellProduct } from "./product.service";
import { toDay } from "../utils/date";
import { chunkify } from "../utils/array";
import CustomerModel from "../models/customer.model";

const JOB_CHUNK_MAX_SIZE = 10;

export const createOrder = async (customerId: number, products: Item[]): Promise<Order> => {
    const date = new Date();
    let totalAmount = 0;
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
    }
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
        const priceCoefficient = calculateProductPriceCoefficient({ location: customer.location, productQuantity: orderProduct.quantity, season });
        const unitPrice = Math.ceil(priceCoefficient * product.price);

        // TODO: dodać pole - zastosowane modyfikatory cen?

        dbOrderProducts.push({ ...orderProduct, unitPrice, unitPriceBeforeDiscount: product.price });
        totalAmount += orderProduct.quantity * unitPrice;
    }

    const sellProductChunks = chunkify(
        products.map((product) => sellProduct(product.productId, product.quantity)),
        JOB_CHUNK_MAX_SIZE
    );

    for (const chunk of sellProductChunks) {
        // TODO: blocked quantity i odjąć je na końcu albo uwolnić, albo założyć jakąś blokadę na bazę danych?
        await Promise.all(sellProductChunks);
    }

    const order = await OrderModel.create({ customerId, products: dbOrderProducts, totalAmount, createdAt: date });
    return order.toObject()
};
