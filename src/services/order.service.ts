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

const processProducts = async (orderProducts: OrderItem[], orderId: string) => {
    for (const [index, orderProduct] of orderProducts.entries()) {
        try {
            await sellProduct(orderProduct.productId, orderProduct.quantity, orderId);
        } catch (error) {
            await rollbackSellProducts(orderProducts.slice(0, index));
            throw error;
        }
    }
};

type OrderInfo = Pick<Order, "_id" | "createdAt" | "customerId">;

const finalizeOrder = async ({ _id, createdAt, customerId }: OrderInfo, orderProducts: OrderItem[], productLookup: ProductLookupObject) => {
    try {
        const { location } = await getCustomer(customerId);
        await dropProductsReservationsForOrderId(_id);
        const { dbOrderProducts, totalAmount } = calculateTotalAmount(orderProducts, productLookup, location, createdAt);
        await OrderModel.create({ _id, customerId, products: dbOrderProducts, totalAmount, createdAt });
    } catch (error) {
        await rollbackSellProducts(orderProducts);
        throw error;
    }
};

export const processAndCreateOrder = async (customerId: number, orderProducts: OrderItem[]): Promise<void> => {
    const orderId = uuid();
    const orderDate = new Date();

    const productLookupObject = await getProductsByIdAsLookupObject(orderProducts.map((product) => product.productId));
    await reserveStock(orderId, orderProducts);
    await processProducts(orderProducts, orderId);
    await finalizeOrder({ _id: orderId, customerId, createdAt: orderDate }, orderProducts, productLookupObject);
};
