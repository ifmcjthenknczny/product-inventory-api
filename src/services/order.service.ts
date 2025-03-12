import Order from "../models/order.model";
import ProductModel from "../models/product.model";
import { Product } from "../types/product.type";

// TODO: return order
// TODO: services are actually controllers?

export const createOrder = async (customerId: string, products: Product[]) => {
  let totalAmount = 0;

  for (const item of products) {
    const product = await ProductModel.findById(item._id);
    if (!product || product.stock < item.quantity) {
        throw new Error("Insufficient stock");
    }
    // TODO: quanity in order
    // TODO: what if there is no product in db

    product.stock -= item.quantity;
    await product.save();

    totalAmount += item.quantity * product.price;
  }

  return await Order.create({ customerId, products, totalAmount });
};
