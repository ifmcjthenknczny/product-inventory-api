import { Cents } from "../utils/price";

export type Product = {
    _id: number;
    name: string;
    description: string;
    unitPrice: Cents;
    stock: number;
};
