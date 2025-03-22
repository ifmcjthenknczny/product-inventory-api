import Holidays from "date-holidays";
import { DateTime } from "luxon";
import { getSeasonalDiscountsSortedByModifierPercent } from "./price";

export type Season = "BlackFriday" | "HolidaySale";

const calculateBlackFridayDate = (year: number) => {
    const november = new Date(year, 10, 1);
    const dayOfWeek = november.getDay();
    const lastFriday = new Date(year, 10, 30 - ((dayOfWeek + 2) % 7));
    return lastFriday.toISOString().split("T")[0];
};

export const determineSeason = (day: DateTime): Season | null => {
    const hd = new Holidays("PL");
    const currentYear = day.year;
    hd.setHoliday(calculateBlackFridayDate(currentYear), {
        name: "Black Friday",
        type: "observance",
    });
    const holidays = hd.isHoliday(day.toString());
    if (!holidays || !holidays?.length) {
        return null;
    }
    const seasons: Season[] = [];
    if (holidays.some((holiday) => holiday.name === "Black Friday")) {
        seasons.push("BlackFriday");
    }
    if (holidays.some((holiday) => holiday.type === "public")) {
        seasons.push("HolidaySale");
    }
    // Sorted from most client profit to least client profit
    return seasons.length ? (getSeasonalDiscountsSortedByModifierPercent().find((season) => seasons.includes(season)) ?? null) : null;
};
