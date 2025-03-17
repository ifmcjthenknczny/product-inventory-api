/* eslint-disable @typescript-eslint/no-explicit-any */

import { calculateTotalAmount } from "./../services/order.service";
import { processAndCreateOrder } from "../services/order.service";
import OrderModel from "../models/order.model";
import {
    getProductsByIdAsLookupObject,
    reserveStock,
    dropProductsReservationsForOrderId,
    sellProduct,
    rollbackSellProducts,
} from "../services/product.service";
import { getCustomer } from "../services/customer.service";
import { determineSeason } from "../utils/holiday";
import { calculateProductPriceCoefficient, determinePriceModifiersForProduct } from "../utils/price";
import { Location } from "../types/customer.type";
import { DateTime } from "luxon";
import { OrderItem } from "../types/order.type";

jest.mock("../models/order.model");
jest.mock("../services/product.service");
jest.mock("../services/customer.service");
jest.mock("../utils/holiday");
jest.mock("../utils/price");

describe("Order Service - processAndCreateOrder", () => {
    const customerId = 1;
    const orderDate = DateTime.now();
    const orderProducts = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
    ];
    const productLookup: any = {
        1: { unitPrice: 100 },
        2: { unitPrice: 200 },
    };
    const location: Location = "US";

    beforeEach(() => {
        jest.clearAllMocks();

        (getCustomer as jest.Mock).mockResolvedValue({ location });
        (getProductsByIdAsLookupObject as jest.Mock).mockResolvedValue(productLookup);

        (reserveStock as jest.Mock).mockResolvedValue(undefined);
        (sellProduct as jest.Mock).mockResolvedValue(undefined);
        (dropProductsReservationsForOrderId as jest.Mock).mockResolvedValue(undefined);
        (rollbackSellProducts as jest.Mock).mockResolvedValue(undefined);

        (determineSeason as jest.Mock).mockReturnValue("HolidaySale");
        (determinePriceModifiersForProduct as jest.Mock).mockReturnValue([]);
        (calculateProductPriceCoefficient as jest.Mock).mockReturnValue(1);

        (OrderModel.create as jest.Mock).mockResolvedValue({ _id: "orderId" });
    });

    it("should process and create order successfully", async () => {
        await processAndCreateOrder(customerId, orderProducts);

        expect(getCustomer).toHaveBeenCalledWith(customerId);
        expect(getProductsByIdAsLookupObject).toHaveBeenCalledWith([1, 2]);
        expect(reserveStock).toHaveBeenCalled();
        expect(sellProduct).toHaveBeenCalledTimes(orderProducts.length);
        expect(OrderModel.create).toHaveBeenCalled();
        expect(dropProductsReservationsForOrderId).toHaveBeenCalled();
        expect(rollbackSellProducts).not.toHaveBeenCalled();

        const createCallArg = (OrderModel.create as jest.Mock).mock.calls[0][0];
        expect(createCallArg.totalAmount).toBe(3 * 200 + 2 * 100);
        expect(createCallArg.products[0].productId).toBe(2);
        expect(createCallArg.products[1].productId).toBe(1);
    });

    it("should rollback if sellProduct fails", async () => {
        (sellProduct as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("sell error")));

        await expect(processAndCreateOrder(customerId, orderProducts)).rejects.toThrow("sell error");

        expect(rollbackSellProducts).toHaveBeenCalledWith([]);
        expect(dropProductsReservationsForOrderId).toHaveBeenCalled();
    });

    it("should rollback if OrderModel.create fails", async () => {
        (OrderModel.create as jest.Mock).mockRejectedValue(new Error("create error"));

        await expect(processAndCreateOrder(customerId, orderProducts)).rejects.toThrow("create error");

        expect(rollbackSellProducts).toHaveBeenCalledWith(orderProducts);
        expect(dropProductsReservationsForOrderId).toHaveBeenCalled();
    });

    it("should correctly calculate total amount without discounts", () => {
        const { totalAmount, dbOrderProducts } = calculateTotalAmount(orderProducts, productLookup, location, orderDate);

        expect(totalAmount).toBe(3 * 200 + 2 * 100);
        expect(dbOrderProducts).toHaveLength(2);
        expect(dbOrderProducts[0].productId).toBe(2);
        expect(dbOrderProducts[1].productId).toBe(1);
    });

    it("should apply a discount correctly", () => {
        (calculateProductPriceCoefficient as jest.Mock).mockReturnValue(0.8);

        const { totalAmount, dbOrderProducts } = calculateTotalAmount(orderProducts, productLookup, location, orderDate);

        expect(totalAmount).toBe(Math.ceil(0.8 * 200) * 3 + Math.ceil(0.8 * 100) * 2);
        expect(dbOrderProducts[0].unitPrice).toBe(Math.ceil(0.8 * 200));
        expect(dbOrderProducts[1].unitPrice).toBe(Math.ceil(0.8 * 100));
    });

    it("should apply a price increase correctly", () => {
        (calculateProductPriceCoefficient as jest.Mock).mockReturnValue(1.2);

        const { totalAmount, dbOrderProducts } = calculateTotalAmount(orderProducts, productLookup, location, orderDate);

        expect(totalAmount).toBe(Math.ceil(1.2 * 200) * 3 + Math.ceil(1.2 * 100) * 2);
        expect(dbOrderProducts[0].unitPrice).toBe(Math.ceil(1.2 * 200));
        expect(dbOrderProducts[1].unitPrice).toBe(Math.ceil(1.2 * 100));
    });

    it("should throw an error if a product is missing from the lookup", () => {
        const invalidOrderProducts: OrderItem[] = [{ productId: 3, quantity: 1 }];

        expect(() => calculateTotalAmount(invalidOrderProducts, productLookup, location, orderDate)).toThrow("Product with ID 3 is unavailable");
    });
});
