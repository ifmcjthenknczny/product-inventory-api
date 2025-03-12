import Holidays from "date-holidays";
import { DateTime } from "luxon";
import { Day } from "./date";

export type Season = "BlackFriday" | "HolidaySale";

export const determineSeason = (day: Day): Season | null => {
    const hd = new Holidays("PL");
    hd.setHoliday("black-friday", {
        name: "Black Friday",
        type: "observance",
        rule: "last Friday in November",
    });
    const date = DateTime.fromISO(day).setZone("Europe/Warsaw").toJSDate();
    const holidays = hd.isHoliday(date);
    if (holidays && holidays.some((holiday) => holiday.name === "Black Friday")) {
        return "BlackFriday";
    } else if (holidays && holidays.some((holiday) => holiday.type === "public")) {
        return "HolidaySale";
    }
    return null;
};
