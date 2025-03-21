import { DateTime } from "luxon";
import { determineSeason } from "../utils/holiday";
import {
    determinePriceModifierCandidatesForProduct,
    calculateProductPriceCoefficient,
    VOLUME_DISCOUNTS,
    LOCATION_PRICE_ADJUSTMENTS_PERCENT,
    SEASONAL_DISCOUNTS,
} from "../utils/price";
import { Location } from "../types/customer.type";
import { PriceModifier } from "../types/order.type";

jest.mock("../models/order.model");

describe("Holiday Utils - determineSeason", () => {
    it("should return BlackFriday for Black Friday date", () => {
        const blackFridayDate = DateTime.fromISO("2025-11-28");
        expect(determineSeason(blackFridayDate)).toBe("BlackFriday");
    });

    it("should return HolidaySale for public holidays", () => {
        const holidayDate = DateTime.fromISO("2025-12-25");
        expect(determineSeason(holidayDate)).toBe("HolidaySale");
    });

    it("should return null for normal days", () => {
        const normalDate = DateTime.fromISO("2025-07-10");
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
