import { Schema, models, model } from "mongoose";

const orderSchema = new Schema({
  customerId: { type: String, required: true },
  products: [
    { productId: String, quantity: Number, price: Number }
  ],
  totalAmount: { type: Number },
});

export default models.order || model("order", orderSchema);
