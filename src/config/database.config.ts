/* eslint-disable no-console */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};
