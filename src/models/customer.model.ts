import { Schema, Model, model, models } from "mongoose";
import { Customer } from "../types/customer.type";

const customerModel = new Schema<Customer>(
    {
        _id: { type: Number, required: true },
        name: { type: String, required: true },
        location: { type: String, required: true },
    },
    { timestamps: true, strict: true, versionKey: false },
);

const CustomerModel: Model<Customer> = models.Customer || model<Customer>("customer", customerModel);

export default CustomerModel;
