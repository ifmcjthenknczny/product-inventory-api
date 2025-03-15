import OrderModel from "../models/order.model";
import { OrderItem, Order } from "../types/order.type";
import { determineSeason } from "../utils/holiday";
import { calculateProductPriceCoefficient, Cents, determinePriceModifiers } from "../utils/price";
import {
    getProductsByIdAsLookupObject,
    ProductLookupObject,
    reserveStock,
    dropProductsReservationsForOrderId,
    sellProduct,
    rollbackSellProducts,
} from "./product.service";
import { toDay } from "../utils/date";
import { getCustomer } from "./customer.service";
import { Location } from "../types/customer.type";
import { v4 as uuid } from "uuid";

const calculateTotalAmount = (products: OrderItem[], productLookup: ProductLookupObject, customerLocation: Location, orderDate: Date) => {
    let totalAmount: Cents = 0;
    const dbOrderProducts: Order["products"] = [];
    const season = determineSeason(toDay(orderDate));

    for (const orderProduct of products) {
        const product = productLookup[orderProduct.productId];
        if (!product) {
            throw new Error(`Product with ID ${orderProduct.productId} is unavailable`);
        }

        const priceModifiers = determinePriceModifiers({ location: customerLocation, productQuantity: orderProduct.quantity, season });
        const priceCoefficient = calculateProductPriceCoefficient(priceModifiers);

        const unitPrice = Math.ceil(priceCoefficient * product.unitPrice);
        dbOrderProducts.push({
            ...orderProduct,
            unitPrice,
            unitPriceBeforeModifiers: product.unitPrice,
            priceModifiers,
        });

        totalAmount += orderProduct.quantity * unitPrice;
    }

    return { dbOrderProducts, totalAmount };
};

export const processAndCreateOrder = async (customerId: number, orderProducts: OrderItem[]): Promise<void> => {
    const orderId = uuid();
    try {
        const orderDate = new Date();
        const customer = await getCustomer(customerId);
        const productLookupObject = await getProductsByIdAsLookupObject(orderProducts.map((product) => product.productId));
        await reserveStock(orderId, orderProducts);
        for (const [index, orderProduct] of orderProducts.entries()) {
            try {
                await sellProduct(orderProduct.productId, orderProduct.quantity);
            } catch (error) {
                const productsToRollback = orderProducts.slice(0, index);
                await rollbackSellProducts(productsToRollback);
                throw error;
            }
        }
        try {
            await dropProductsReservationsForOrderId(orderId);
            const { dbOrderProducts, totalAmount } = calculateTotalAmount(orderProducts, productLookupObject, customer.location, orderDate);
            await OrderModel.create({ _id: orderId, customerId, products: dbOrderProducts, totalAmount, createdAt: orderDate });
        } catch (error) {
            await rollbackSellProducts(orderProducts);
            throw error;
        }
    } catch (error) {
        await dropProductsReservationsForOrderId(orderId);
        throw error;
    }
};
