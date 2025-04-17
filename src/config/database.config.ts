/* eslint-disable no-console */

import mongoose from "mongoose";

let cachedDb: mongoose.mongo.Db | undefined = undefined;

export const dbConnect = async () => {
    if (cachedDb) {
        return cachedDb;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI!, {
            dbName: process.env.DATABASE_NAME,
            serverSelectionTimeoutMS: 5000,
        });
        cachedDb = mongoose.connection.db;
        return cachedDb;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error(`Problem connecting with mongo: ${err.mesage}`);
    }

    return cachedDb;
};
