import { Cents } from "../utils/price";

export type ReservedStock = {
    orderId: string;
    quantity: number;
};

export type Product = {
    _id: number;
    name: string;
    description: string;
    unitPrice: Cents;
    stock: number;
    reservedStock: ReservedStock[];
};

export type PublicProduct = Omit<Product, "reservedStock">;
