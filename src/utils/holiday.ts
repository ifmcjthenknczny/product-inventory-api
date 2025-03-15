import Holidays from "date-holidays";
import { DateTime } from "luxon";

export type Season = "BlackFriday" | "HolidaySale";

const determineBlackFridayDate = (year: number) => {
    const november = new Date(year, 10, 1);
    const dayOfWeek = november.getDay();
    const lastFriday = new Date(year, 10, 30 - ((dayOfWeek + 2) % 7));
    return lastFriday.toISOString().split("T")[0];
};

export const determineSeason = (day: DateTime): Season | null => {
    const hd = new Holidays("PL");
    const currentYear = day.year;
    hd.setHoliday(determineBlackFridayDate(currentYear), {
        name: "Black Friday",
        type: "observance",
    });
    const holidays = hd.isHoliday(day.toString());
    if (!holidays || !holidays?.length) {
        return null;
    }
    if (holidays.some((holiday) => holiday.name === "Black Friday")) {
        return "BlackFriday";
    } else if (holidays.some((holiday) => holiday.type === "public")) {
        return "HolidaySale";
    }
    return null;
};
