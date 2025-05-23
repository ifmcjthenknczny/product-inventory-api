import OrderModel from "../models/order.model";
import { OrderItem, Order } from "../types/order.type";
import { determineSeason } from "../utils/holiday";
import { calculateProductPriceCoefficient, Cents, determinePriceModifierCandidatesForProduct, stripExcessCategoryDiscounts } from "../utils/price";
import {
    getProductsByIdAsLookupObject,
    ProductLookupObject,
    reserveStock,
    dropProductsReservationsForOrderId,
    sellProduct,
    rollbackSellProducts,
} from "./product.service";
import { getCustomer } from "./customer.service";
import { Location } from "../types/customer.type";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";

type OrderInfo = Pick<Order, "_id" | "customerId"> & { createdAt: DateTime; location: Location };

const applyPriceModifiersAndCalculateTotalAmount = (dbOrderProducts: Order["products"]) => {
    let totalAmount: Cents = 0;
    for (const [index, orderProduct] of dbOrderProducts.entries()) {
        if (orderProduct.priceModifiers?.length) {
            const priceCoefficient = calculateProductPriceCoefficient(orderProduct.priceModifiers);
            const unitPrice = Math.ceil(priceCoefficient * orderProduct.unitPrice);
            dbOrderProducts[index] = {
                ...dbOrderProducts[index],
                unitPriceBeforeModifiers: orderProduct.unitPrice,
                unitPrice,
            };
        }
        const { unitPrice, quantity } = dbOrderProducts[index];
        totalAmount += unitPrice * quantity;
    }
    return totalAmount;
};

const addPriceToOrderProducts = (orderProducts: OrderItem[], productLookup: ProductLookupObject) => {
    const orderProductsWithPrice = orderProducts.map((product) => {
        const productData = productLookup[product.productId];
        if (!productData) {
            throw new Error(`Product with ID ${product.productId} is unavailable`);
        }
        return { ...product, unitPrice: productData.unitPrice };
    });

    return orderProductsWithPrice;
};

export const calculateTotalAmount = (
    orderProducts: OrderItem[],
    productLookup: ProductLookupObject,
    customerLocation: Location,
    orderDate: DateTime,
) => {
    const dbOrderProducts: Order["products"] = [];
    const season = determineSeason(orderDate);
    const orderProductsSortedByTotalValue = addPriceToOrderProducts(orderProducts, productLookup);

    for (const orderProduct of orderProductsSortedByTotalValue) {
        const priceModifiers = determinePriceModifierCandidatesForProduct({
            location: customerLocation,
            productQuantity: orderProduct.quantity,
            season,
        });

        dbOrderProducts.push({
            ...orderProduct,
            ...(!!priceModifiers?.length && { priceModifiers: priceModifiers.filter((priceModifier) => !!priceModifier.modifierPercent) }),
        });
    }

    stripExcessCategoryDiscounts(dbOrderProducts, productLookup);
    const totalAmount: Cents = applyPriceModifiersAndCalculateTotalAmount(dbOrderProducts);

    return { dbOrderProducts, totalAmount };
};

const processProducts = async (orderId: string, orderProducts: OrderItem[]) => {
    for (const [index, orderProduct] of orderProducts.entries()) {
        try {
            await sellProduct(orderProduct.productId, orderProduct.quantity, orderId);
        } catch (error) {
            await rollbackSellProducts(orderProducts.slice(0, index));
            await dropProductsReservationsForOrderId(orderId);
            throw error;
        }
    }
};

const finalizeOrder = async ({ _id, createdAt, location, customerId }: OrderInfo, orderProducts: OrderItem[], productLookup: ProductLookupObject) => {
    try {
        const { dbOrderProducts, totalAmount } = calculateTotalAmount(orderProducts, productLookup, location, createdAt);
        await OrderModel.create({ _id, customerId, products: dbOrderProducts, totalAmount, createdAt });
    } catch (error) {
        await rollbackSellProducts(orderProducts);
        throw error;
    } finally {
        await dropProductsReservationsForOrderId(_id);
    }
};

export const processAndCreateOrder = async (customerId: number, orderProducts: OrderItem[]): Promise<void> => {
    const orderId = uuid();
    const orderDate = DateTime.now().setZone("Europe/Warsaw");
    const { location } = await getCustomer(customerId); // it is better to check it earlier, than to provide only customerId to finalizeOrder and get location there

    const productLookupObject = await getProductsByIdAsLookupObject(orderProducts.map((product) => product.productId));
    await reserveStock(orderId, orderProducts);
    await processProducts(orderId, orderProducts);
    await finalizeOrder({ _id: orderId, customerId, location, createdAt: orderDate }, orderProducts, productLookupObject);
};
