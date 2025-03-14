import { Collection, Document } from "mongodb";

export const findNextId = async <T extends { _id: number }>(collection: Collection<T & Document>): Promise<number> => {
    const lastDoc = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    return lastDoc.length > 0 ? lastDoc[0]._id + 1 : 1;
};
