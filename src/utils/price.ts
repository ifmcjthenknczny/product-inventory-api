import { Location } from "./../types/customer.type";
import { Season } from "./holiday";
import { PriceModifier } from "../types/order.type";
import { geometricSumFromPercentCoefficients } from "./common";
import { PriceModifierDetails } from "../types/order.type";

export type Cents = number;

export const toCents = (value: number): number => Math.round(value * 100);

export const fromCents = (value: number): number => value / 100;

export type ProductDiscountCounter = Partial<Record<PriceModifierDetails, number>>;

const VOLUME_DISCOUNT_PERCENTS: Record<number, number> = {
    // min quantity of given product type, discount in percent
    5: -10,
    10: -20,
    50: -30,
};

const SEASONAL_DISCOUNT_PERCENTS: Record<Season, { modifierPercent: number; maxProductTypes?: number }> = {
    BlackFriday: { modifierPercent: -25 },
    HolidaySale: { modifierPercent: -15, maxProductTypes: 2 },
};

const calculateVolumeDiscount = (productQuantity: number): PriceModifier | null => {
    const sortedThresholds = Object.keys(VOLUME_DISCOUNT_PERCENTS)
        .map(Number)
        .sort((a, b) => b - a);

    for (const threshold of sortedThresholds) {
        if (productQuantity >= threshold) {
            const modifierPercent = VOLUME_DISCOUNT_PERCENTS[threshold];
            return { name: "VolumeDiscount", details: `Volume${threshold}`, modifierPercent };
        }
    }
    return null;
};

const calculateSeasonalDiscount = (season: Season | null, productDiscountCounters: ProductDiscountCounter): PriceModifier | null => {
    if (!season) {
        return null;
    }

    const { modifierPercent, maxProductTypes } = SEASONAL_DISCOUNT_PERCENTS[season];

    if (maxProductTypes === undefined || (productDiscountCounters?.[season] || 0) < maxProductTypes) {
        return { name: "SeasonalDiscount", details: season, modifierPercent };
    }

    return null;
};

const determineHighestDiscountType = (...discounts: (PriceModifier | null | undefined)[]): PriceModifier | null => {
    const validDiscounts = discounts.filter((discount): discount is PriceModifier => discount !== null && discount !== undefined);

    if (validDiscounts.length === 0) {
        return null;
    }

    return validDiscounts.reduce((lowest, current) => (current.modifierPercent < lowest.modifierPercent ? current : lowest));
};

const determineProductDiscount = (
    productQuantity: number,
    season: Season | null,
    productDiscountCounters: ProductDiscountCounter,
): PriceModifier | null => {
    const volumeDiscount = calculateVolumeDiscount(productQuantity);
    const seasonalDiscount = calculateSeasonalDiscount(season, productDiscountCounters);

    const appliedDiscount = determineHighestDiscountType(volumeDiscount, seasonalDiscount);

    if (appliedDiscount?.details) {
        const detailKey = appliedDiscount.details;
        productDiscountCounters[detailKey] = (productDiscountCounters[detailKey] || 0) + 1;
    }

    return appliedDiscount;
};

export const LOCATION_PRICE_ADJUSTMENTS_PERCENT: Record<Location, number> = {
    Europe: 15,
    Asia: -5,
    US: 0,
};

export const determinePriceModifiersForProduct = ({
    location,
    productDiscountCounters,
    productQuantity,
    season,
}: {
    productDiscountCounters: ProductDiscountCounter;
    location: Location;
    productQuantity: number;
    season: Season | null;
}): PriceModifier[] => {
    const discount = determineProductDiscount(productQuantity, season, productDiscountCounters);
    const priceLocationModifier: PriceModifier = {
        name: "LocationBased",
        details: location,
        modifierPercent: LOCATION_PRICE_ADJUSTMENTS_PERCENT[location],
    };

    return [discount, priceLocationModifier].filter((modifier) => !!modifier);
};

export const calculateProductPriceCoefficient = (priceModifiers: PriceModifier[]): number => {
    return geometricSumFromPercentCoefficients(priceModifiers.map((modifier) => modifier.modifierPercent));
};
