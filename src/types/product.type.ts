import { Cents } from "../utils/price";

export type Product = {
	_id?: string;
	name: string;
	description: string,
	price: Cents,
	stock: number,
}
