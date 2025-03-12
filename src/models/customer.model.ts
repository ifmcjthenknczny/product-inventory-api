import { Schema, model, models } from "mongoose";
import { Customer } from "../types/customer.type";

const customerSchema = new Schema<Customer>({
    _id: { type: Number, required: true },
    name: {type: String, required: true},
    location: { type: String, required: true },
  });

export default models.Customer || model('Customer', customerSchema)