import { Cents } from "../utils/price";

type Percent = number;

export type OrderItem = {
    productId: number;
    quantity: number;
};

export enum PRICE_MODIFIER_TYPES {
    "SeasonalDiscount" = "SeasonalDiscount",
    "VolumeDiscount" = "VolumeDiscount",
    "LocationBased" = "LocationBased",
}

type PriceModifierType = keyof typeof PRICE_MODIFIER_TYPES;

export type PriceModifier = {
    name: PriceModifierType;
    modifierPercent: Percent;
};

type OrderProduct = OrderItem & {
    unitPrice: Cents;
    unitPriceBeforeModifiers?: Cents;
    priceModifiers?: PriceModifier[];
};

export type Order = {
    _id: string;
    customerId: number;
    products: OrderProduct[];
    totalAmount: Cents;
    createdAt: Date;
};
