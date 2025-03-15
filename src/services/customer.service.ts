import { Customer } from "../types/customer.type";
import CustomerModel from "../models/customer.model";

export const getCustomer = async (customerId: number) => {
    const customer = await CustomerModel.findById<Customer>(customerId).lean<Customer>();
    if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
    }
    return customer;
};
