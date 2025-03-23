import { Model } from "mongoose";

export const findNextId = async <T extends { _id: number }>(model: Model<T>): Promise<number> => {
    const lastDoc = await model.findOne().sort({ _id: -1 }).lean();
    return lastDoc ? lastDoc._id + 1 : 1;
};
