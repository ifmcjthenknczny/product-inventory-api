import { Schema, model, models } from "mongoose";
import { Customer } from "../types/customer.type";

const customerModel = new Schema<Customer>({
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
});

export default models.Customer<Customer> || model<Customer>("Customer", customerModel);
