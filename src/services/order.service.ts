import OrderModel from "../models/order.model";
import { OrderItem, Order } from "../types/order.type";
import { determineSeason } from "../utils/holiday";
import { calculateProductPriceCoefficient, Cents, determinePriceModifiers } from "../utils/price";
import { getProductsByIdAsLookupObject, ProductLookupMap, sellProduct } from "./product.service";
import { toDay } from "../utils/date";
import { chunkify } from "../utils/array";
import { getCustomer } from "./customer.service";
import { Location } from "../types/customer.type";

const JOB_CHUNK_MAX_SIZE = 10;

const validateAndCalculateProducts = (products: OrderItem[], productMap: ProductLookupMap, customerLocation: Location, orderDate: Date) => {
    let totalAmount: Cents = 0;
    const dbOrderProducts: Order["products"] = [];
    const season = determineSeason(toDay(orderDate));

    for (const orderProduct of products) {
        const product = productMap[orderProduct.productId];
        if (!product) {
            throw new Error(`Product with ID ${orderProduct.productId} is unavailable`);
        }
        if (product.stock < orderProduct.quantity) {
            throw new Error(`Insufficient stock for product ID ${orderProduct.productId}`);
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

export const createOrder = async (customerId: number, orderProducts: OrderItem[]): Promise<void> => {
    const orderDate = new Date();
    const customer = await getCustomer(customerId);
    const productLookupObject = await getProductsByIdAsLookupObject(orderProducts.map((product) => product.productId));

    const { dbOrderProducts, totalAmount } = validateAndCalculateProducts(orderProducts, productLookupObject, customer.location, orderDate);

    const sellProductChunks = chunkify(
        orderProducts.map((product) => sellProduct(product.productId, product.quantity)),
        JOB_CHUNK_MAX_SIZE,
    );

    for (const chunk of sellProductChunks) {
        // TODO: dodać pole reserved
        await Promise.all(chunk);
    }

    await OrderModel.create({ customerId, products: dbOrderProducts, totalAmount, createdAt: orderDate });
};
