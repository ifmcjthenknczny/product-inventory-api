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

jest.mock("../models/order.model");
jest.mock("../services/product.service");
jest.mock("../services/customer.service");
jest.mock("../utils/holiday");
jest.mock("../utils/price");

describe("Order Service - processAndCreateOrder", () => {
    const customerId = 1;
    const orderProducts = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
    ];
    const productLookup = {
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

        (determineSeason as jest.Mock).mockReturnValue("summer");
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
});
