import { DateTime } from "luxon";
import { determineSeason } from "../utils/holiday";
import {
    determinePriceModifierCandidatesForProduct,
    calculateProductPriceCoefficient,
    VOLUME_DISCOUNTS,
    LOCATION_PRICE_ADJUSTMENTS_PERCENT,
    SEASONAL_DISCOUNTS,
    stripExcessCategoryDiscounts,
    findHighestDiscountCategories,
} from "../utils/price";
import { Location } from "../types/customer.type";
import { Order, PriceModifier } from "../types/order.type";
import { ProductLookupObject } from "../services/product.service";

jest.mock("../models/order.model");

const orderProducts = [
    { productId: 1, unitPrice: 100, quantity: 2, priceModifiers: [{ details: "HolidaySale" }] },
    { productId: 2, unitPrice: 50, quantity: 4, priceModifiers: [{ details: "HolidaySale" }] },
    { productId: 3, unitPrice: 200, quantity: 1, priceModifiers: [{ details: "HolidaySale" }] },
    { productId: 4, unitPrice: 75, quantity: 3, priceModifiers: [{ details: "HolidaySale" }] },
] as Order["products"];

const productLookupObject = {
    1: { categoryId: 30 },
    2: { categoryId: 10 },
    3: { categoryId: 10 },
    4: { categoryId: 20 },
} as unknown as ProductLookupObject;

describe("Holiday Utils - determineSeason", () => {
    it("should return BlackFriday for Black Friday date", () => {
        const blackFridayDate = DateTime.fromISO("2025-11-28").setZone("Europe/Warsaw");
        expect(determineSeason(blackFridayDate)).toBe("BlackFriday");
    });

    it("should return HolidaySale for public holidays", () => {
        const holidayDate = DateTime.fromISO("2025-12-25").setZone("Europe/Warsaw");
        expect(determineSeason(holidayDate)).toBe("HolidaySale");
    });

    it("should return null for normal days", () => {
        const normalDate = DateTime.fromISO("2025-07-10").setZone("Europe/Warsaw");
        expect(determineSeason(normalDate)).toBeNull();
    });
});

describe("Price Utils - determinePriceModifiersForProduct", () => {
    it("should prefer seasonal over volume discount, when it is best from user's point of view", () => {
        const productQuantity = 15;
        const priceModifiers = determinePriceModifierCandidatesForProduct({
            location: "Europe" as Location,
            productQuantity,
            season: "BlackFriday",
        });

        expect(priceModifiers).toEqual([
            { name: "SeasonalDiscount", details: "BlackFriday", modifierPercent: SEASONAL_DISCOUNTS["BlackFriday"].modifierPercent },
            { name: "LocationBased", details: "Europe", modifierPercent: LOCATION_PRICE_ADJUSTMENTS_PERCENT["Europe"] },
        ]);
    });

    it("should prefer volume over seasonal discount, when it is best from user's point of view", () => {
        const productQuantity = 50;
        const priceModifiers = determinePriceModifierCandidatesForProduct({
            location: "US" as Location,
            productQuantity,
            season: "BlackFriday",
        });

        expect(priceModifiers).toEqual([
            { name: "VolumeDiscount", details: `Volume${productQuantity}`, modifierPercent: VOLUME_DISCOUNTS[productQuantity] },
            { name: "LocationBased", details: "US", modifierPercent: LOCATION_PRICE_ADJUSTMENTS_PERCENT["US"] || 0 },
        ]);
    });

    it("should not return only location based modifiers if not qualified for discount", () => {
        const productQuantity = 4;
        const priceModifiers = determinePriceModifierCandidatesForProduct({
            location: "US" as Location,
            productQuantity,
            season: null,
        });

        expect(priceModifiers).toEqual([{ name: "LocationBased", details: "US", modifierPercent: LOCATION_PRICE_ADJUSTMENTS_PERCENT["US"] || 0 }]);
    });
});

describe("Price Utils - calculateProductPriceCoefficient", () => {
    it("should correctly calculate the price coefficient", () => {
        const priceModifiers: PriceModifier[] = [
            { name: "VolumeDiscount", details: "Volume10", modifierPercent: -20 },
            { name: "LocationBased", details: "Europe", modifierPercent: 15 },
        ];
        expect(calculateProductPriceCoefficient(priceModifiers)).toBeCloseTo(0.92, 2);
    });
});

describe("Price Utils - findHighestDiscountCategories", () => {
    it("should return the top N categories with the highest total discounted value", () => {
        expect(findHighestDiscountCategories([...orderProducts], productLookupObject, 2)).toEqual([10, 20]);
    });
});

describe("Price Utils - stripExcessCategoryDiscounts", () => {
    it("should remove seasonal discounts from products in excess categories", () => {
        stripExcessCategoryDiscounts([...orderProducts], productLookupObject);

        expect(orderProducts[0].priceModifiers).toBeUndefined();
        expect(orderProducts[1].priceModifiers).toEqual([{ details: "HolidaySale" }]);
        expect(orderProducts[2].priceModifiers).toEqual([{ details: "HolidaySale" }]);
        expect(orderProducts[2].priceModifiers).toEqual([{ details: "HolidaySale" }]);
    });
});
