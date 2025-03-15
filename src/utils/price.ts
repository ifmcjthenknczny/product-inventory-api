import { Location } from "./../types/customer.type";
import { Season } from "./holiday";
import { PriceModifier } from "../types/order.type";
import { geometricSumFromPercentCoefficients } from "./common";

export type Cents = number;

export const toCents = (value: number): number => Math.round(value * 100);

export const fromCents = (value: number): number => value / 100;

const calculateVolumeDiscountPercent = (productQuantity: number) => {
    if (productQuantity >= 50) {
        return -30;
    } else if (productQuantity >= 10) {
        return -20;
    } else if (productQuantity >= 5) {
        return -10;
    }
    return 0;
};

const calculateSeasonalDiscountPercent = (season: Season | null) => {
    if (season === "BlackFriday") {
        return -25;
    } else if (season === "HolidaySale") {
        return -15;
    }
    return 0;
};

const determineProductDiscountPercent = (productQuantity: number, season: Season | null): PriceModifier => {
    const volumeDiscountPercent = calculateVolumeDiscountPercent(productQuantity);
    const seasonalDiscountPercent = calculateSeasonalDiscountPercent(season);

    const isVolumeDiscountHigher = volumeDiscountPercent <= seasonalDiscountPercent;

    return {
        modifierPercent: Math.min(volumeDiscountPercent, seasonalDiscountPercent),
        name: isVolumeDiscountHigher ? "VolumeDiscount" : "SeasonalDiscount",
    };
};

const calculateLocationPriceAdjustment = (location: Location) => {
    if (location === "Europe") {
        return 15;
    } else if (location === "Asia") {
        return -5;
    }
    return 0;
};

export const determinePriceModifiers = ({
    location,
    productQuantity,
    season,
}: {
    location: Location;
    productQuantity: number;
    season: Season | null;
}): PriceModifier[] => {
    const discount = determineProductDiscountPercent(productQuantity, season);
    const priceLocationModifier: PriceModifier = { name: "LocationBased", modifierPercent: calculateLocationPriceAdjustment(location) };

    return [discount, priceLocationModifier].filter((modifier) => !!modifier.modifierPercent);
};

export const calculateProductPriceCoefficient = (priceModifiers: PriceModifier[]): number => {
    return geometricSumFromPercentCoefficients(priceModifiers.map((modifier) => modifier.modifierPercent));
};
