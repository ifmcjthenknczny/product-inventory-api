import { Season } from "./holiday";
import { Location } from "../types/customer.type";

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

const calculateProductDiscountPercent = (productQuantity: number, season: Season | null) => {
    const volumeDiscountPercent = calculateVolumeDiscountPercent(productQuantity);
    const seasonalDiscountPercent = calculateSeasonalDiscountPercent(season);
    return Math.max(volumeDiscountPercent, seasonalDiscountPercent);
};

const calculateLocationPriceAdjustment = (location: Location) => {
    if (location === "Europe") {
        return 15;
    } else if (location === "Asia") {
        return -5;
    }
    return 0;
};

export const calculateProductPriceCoefficient = ({
    location,
    productQuantity,
    season,
}: {
    location: Location;
    productQuantity: number;
    season: Season | null;
}) => {
    const discount = calculateProductDiscountPercent(productQuantity, season);
    const priceLocationAdjustment = calculateLocationPriceAdjustment(location);

    return (1 + fromCents(discount)) * (1 + fromCents(priceLocationAdjustment));
};
