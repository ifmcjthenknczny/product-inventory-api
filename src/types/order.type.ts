import { Cents } from "../utils/price";

export type Item = {
    productId: number;
    quantity: number;
};

type OrderProduct = Item & {
    unitPrice: Cents;
    unitPriceBeforeDiscount?: Cents;
};

export type Order = {
    _id?: string;
    customerId: number;
    products: OrderProduct[];
    totalAmount: Cents;
    createdAt: Date;
};
