import { Location } from "./../types/customer.type";
import { Season } from "./holiday";
import { Order, PriceModifier } from "../types/order.type";
import { geometricSumFromPercentCoefficients } from "./common";
import { ProductLookupObject } from "../services/product.service";

export type Cents = number;

export const toCents = (value: number): number => Math.round(value * 100);

export const fromCents = (value: number): number => value / 100;

export const VOLUME_DISCOUNTS: Record<number, number> = {
    // min quantity (included) of given product: discount in percent
    5: -10,
    10: -20,
    50: -30,
};

export const SEASONAL_DISCOUNTS: Record<Season, { modifierPercent: number; categoryLimit?: number }> = {
    BlackFriday: { modifierPercent: -25 },
    HolidaySale: { modifierPercent: -15, categoryLimit: 2 },
};

const calculateVolumeDiscount = (productQuantity: number): PriceModifier | null => {
    const sortedThresholds = Object.keys(VOLUME_DISCOUNTS)
        .map(Number)
        .sort((a, b) => b - a);

    for (const threshold of sortedThresholds) {
        if (productQuantity >= threshold) {
            const modifierPercent = VOLUME_DISCOUNTS[threshold];
            return { name: "VolumeDiscount", details: `Volume${threshold}`, modifierPercent };
        }
    }
    return null;
};

const calculateSeasonalDiscount = (season: Season | null): PriceModifier | null => {
    return season ? { name: "SeasonalDiscount", details: season, modifierPercent: SEASONAL_DISCOUNTS[season].modifierPercent } : null;
};

const determineHighestDiscountType = (...discounts: (PriceModifier | null | undefined)[]): PriceModifier | null => {
    const validDiscounts = discounts.filter((discount): discount is PriceModifier => discount !== null && discount !== undefined);

    if (validDiscounts.length === 0) {
        return null;
    }

    return validDiscounts.reduce((lowest, current) => (current.modifierPercent < lowest.modifierPercent ? current : lowest));
};

const determineProductDiscount = (productQuantity: number, season: Season | null): PriceModifier | null => {
    const volumeDiscount = calculateVolumeDiscount(productQuantity);
    const seasonalDiscount = calculateSeasonalDiscount(season);

    return determineHighestDiscountType(volumeDiscount, seasonalDiscount);
};

export const LOCATION_PRICE_ADJUSTMENTS_PERCENT: Record<Location, number> = {
    Europe: 15,
    Asia: -5,
    US: 0,
};

export const determinePriceModifierCandidatesForProduct = ({
    location,
    productQuantity,
    season,
}: {
    location: Location;
    productQuantity: number;
    season: Season | null;
}): PriceModifier[] => {
    const discount = determineProductDiscount(productQuantity, season);
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

const getSeasonalDiscountsWithCategoryLimit = (): (keyof typeof SEASONAL_DISCOUNTS)[] => {
    return Object.entries(SEASONAL_DISCOUNTS)
        .filter(([, value]) => "categoryLimit" in value)
        .sort(([, a], [, b]) => b.modifierPercent - a.modifierPercent)
        .map(([key]) => key as keyof typeof SEASONAL_DISCOUNTS);
};

const findHighestDiscountCategories = (orderProducts: Order["products"], productLookupObject: ProductLookupObject, categoryLimit: number) => {
    const categoriesByDiscountedValue = orderProducts.reduce<Record<number, number>>((acc, orderProduct) => {
        const categoryId = productLookupObject[orderProduct.productId]?.categoryId;
        if (categoryId) {
            acc[categoryId] = (acc[categoryId] || 0) + (orderProduct.unitPriceBeforeModifiers ?? orderProduct.unitPrice) * orderProduct.quantity;
        }
        return acc;
    }, {});

    const discountedCategoryIds = Object.entries(categoriesByDiscountedValue)
        .map(([categoryId, totalValue]) => ({ categoryId: Number(categoryId), totalValue }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, categoryLimit)
        .map((categoryInfo) => categoryInfo.categoryId);

    return discountedCategoryIds;
};

export const stripExcessCategoryDiscounts = (dbOrderProducts: Order["products"], productLookupObject: ProductLookupObject) => {
    const seasonalDiscounts = getSeasonalDiscountsWithCategoryLimit();

    for (const season of seasonalDiscounts) {
        const categoryLimit = SEASONAL_DISCOUNTS[season].categoryLimit!;
        const discountedProducts = dbOrderProducts.filter((orderProduct) =>
            orderProduct.priceModifiers?.some((priceModifier) => priceModifier.details === season),
        );
        const discountedCategoryIds = findHighestDiscountCategories(discountedProducts, productLookupObject, categoryLimit);

        for (const [index, orderProduct] of dbOrderProducts.entries()) {
            const isSeasonalDiscounted = orderProduct.priceModifiers?.some((modifier) => modifier.details === season);
            const isInDiscountedCategory = discountedCategoryIds.includes(productLookupObject[orderProduct.productId]?.categoryId);

            if (isSeasonalDiscounted && !isInDiscountedCategory) {
                const newPriceModifiers = orderProduct.priceModifiers!.filter((priceModifier) => priceModifier.details !== season);
                if (newPriceModifiers.length) {
                    dbOrderProducts[index].priceModifiers = newPriceModifiers;
                    continue;
                }
                delete dbOrderProducts[index].priceModifiers;
            }
        }
    }
};
