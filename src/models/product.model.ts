import { Schema, models, model } from "mongoose";

const productSchema = new Schema({
	name: { type: String, required: true, maxlength: 50 },
	description: { type: String },
	price: { type: Number, required: true, min: 0 },
	stock: { type: Number, required: true, min: 0 },
  });

export default models.product || model("product", productSchema);
