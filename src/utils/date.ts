import { DateTime } from "luxon";

export type Day = `${number}-${number}-${number}`;

export const toDay = (date: Date): Day => {
    return DateTime.fromJSDate(date).toFormat("YYYY-MM-DD") as Day;
};
