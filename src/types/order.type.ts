import { Cents } from "../utils/price";
import { Season } from "../utils/holiday";
import { Location } from "./customer.type";

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

export type PriceModifierDetails = Season | `Volume${number}` | Location;

export type PriceModifier = {
    name: PriceModifierType;
    details: PriceModifierDetails;
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
    updatedAt?: Date;
};
