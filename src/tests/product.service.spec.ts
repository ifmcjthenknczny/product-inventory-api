/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    getAllProducts,
    createProduct,
    restockProduct,
    sellProduct,
    getProductsByIdAsLookupObject,
    dropProductsReservationsForOrderId,
    reserveStock,
    rollbackSellProducts,
} from "../services/product.service";
import ProductModel from "../models/product.model";
import { toCents, fromCents } from "../utils/price";

jest.mock("../utils/db", () => ({
    findNextId: jest.fn().mockResolvedValue(1),
}));

describe("Product Service", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe("getAllProducts", () => {
        it("should return public products with transformed data", async () => {
            const fakeProducts = [
                {
                    _id: 1,
                    name: "Product 1",
                    unitPrice: 1000,
                    stock: 50,
                    reservedStock: [{ orderId: "order1", quantity: 10 }],
                    extraField: "foo",
                },
                {
                    _id: 2,
                    name: "Product 2",
                    unitPrice: 2000,
                    stock: 30,
                    reservedStock: [],
                    extraField: "bar",
                },
            ];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProducts)),
            } as any);

            const publicProducts = await getAllProducts();

            expect(publicProducts).toHaveLength(2);
            expect(publicProducts[0]).toMatchObject({
                name: "Product 1",
                unitPrice: fromCents(fakeProducts[0].unitPrice),
                stock: fakeProducts[0].stock - 10,
                extraField: "foo",
            });
            expect(publicProducts[0]).not.toHaveProperty("reservedStock");
            expect(publicProducts[0]).not.toHaveProperty("unitPrice", fakeProducts[0].unitPrice);
        });
    });

    describe("createProduct", () => {
        it("should create a product with a new id and converted unit price", async () => {
            const productData = { name: "New Product", description: "Example description", unitPrice: 10, stock: 100 };
            const createSpy = jest.spyOn(ProductModel, "create").mockResolvedValue({ _id: 1 } as any);

            await createProduct(productData);

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: 1,
                    name: "New Product",
                    stock: 100,
                    unitPrice: toCents(productData.unitPrice),
                }),
            );
        }, 10000);
    });

    describe("restockProduct", () => {
        it("should update product stock by incrementing the quantity", async () => {
            const productId = 1;
            const quantity = 20;
            const updateSpy = jest.spyOn(ProductModel, "findByIdAndUpdate").mockResolvedValue({ stock: 120 });

            await restockProduct(productId, quantity);

            expect(updateSpy).toHaveBeenCalledWith(productId, { $inc: { stock: quantity } }, { new: true });
        });
    });

    describe("sellProduct", () => {
        it("should sell the product when enough stock is available", async () => {
            const productId = 1;
            const quantity = 5;
            const fakeProduct = { _id: productId, unitPrice: 1000, stock: 10, reservedStock: [] };
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);
            const updateSpy = jest.spyOn(ProductModel, "findByIdAndUpdate").mockResolvedValue({ stock: 5 });

            await sellProduct(productId, quantity, "order1");

            expect(updateSpy).toHaveBeenCalledWith(productId, { $inc: { stock: -quantity } }, { new: true });
        });

        it("should throw an error if the product is not found", async () => {
            const productId = 1;
            const quantity = 5;
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(null)),
            } as any);

            await expect(sellProduct(productId, quantity, "order1")).rejects.toThrow(`Product with ID ${productId} is unavailable`);
        });

        it("should throw an error if there is insufficient stock", async () => {
            const productId = 1;
            const quantity = 15;
            const fakeProduct = { _id: productId, unitPrice: 1000, stock: 10, reservedStock: [] };
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);

            await expect(sellProduct(productId, quantity, "order1")).rejects.toThrow(`Insufficient stock for product id ${productId}`);
        });

        it("should throw a concurrency error when reserved quantity exceeds stock", async () => {
            const productId = 1;
            const quantity = 5;
            const fakeProduct = {
                _id: productId,
                unitPrice: 1000,
                stock: 10,
                reservedStock: [{ orderId: "x", quantity: 15 }],
            };
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);

            await expect(sellProduct(productId, quantity, "order1")).rejects.toThrow("Concurrency error");
        });
    });

    describe("getProductsByIdAsLookupObject", () => {
        it("should return a lookup object for given product ids", async () => {
            const fakeProducts = [
                { _id: 1, unitPrice: 1000, stock: 50, reservedStock: [{ orderId: "order1", quantity: 5 }], name: "Product 1" },
                { _id: 2, unitPrice: 2000, stock: 30, reservedStock: [], name: "Product 2" },
            ];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProducts)),
            } as any);

            const lookup = await getProductsByIdAsLookupObject([1, 2]);

            expect(lookup).toHaveProperty("1");
            expect(lookup).toHaveProperty("2");
            expect(lookup[1]).not.toHaveProperty("_id");
            expect(lookup[1]).toMatchObject({ name: "Product 1" });
        });
    });

    describe("dropProductsReservationsForOrderId", () => {
        it("should drop reservations for the given order id", async () => {
            const orderId = "order1";

            const updateManySpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await dropProductsReservationsForOrderId(orderId);

            expect(updateManySpy).toHaveBeenCalledWith({ "reservedStock.orderId": orderId }, { $pull: { reservedStock: { orderId } } });
        });
    });

    describe("reserveStock", () => {
        it("should reserve stock for each order product when enough stock exists", async () => {
            const orderId = "order1";
            const orderProducts = [
                { productId: 1, quantity: 5 },
                { productId: 2, quantity: 3 },
            ];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(
                    Promise.resolve([
                        { _id: 1, unitPrice: 1000, stock: 10, reservedStock: [] },
                        { _id: 2, unitPrice: 2000, stock: 10, reservedStock: [] },
                    ]),
                ),
            } as any);
            const updateOneSpy = jest.spyOn(ProductModel, "updateOne").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);
            const dropReservationsSpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await reserveStock(orderId, orderProducts);

            expect(updateOneSpy).toHaveBeenCalledTimes(orderProducts.length);
            expect(dropReservationsSpy).not.toHaveBeenCalled();
        });

        it("should throw an error and drop reservations if a product is unavailable", async () => {
            const orderId = "order1";
            const orderProducts = [{ productId: 420, quantity: 5 }];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve([])),
            } as any);
            const dropReservationsSpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await expect(reserveStock(orderId, orderProducts)).rejects.toThrow(`Product with ID ${orderProducts[0].productId} is unavailable`);
            expect(dropReservationsSpy).toHaveBeenCalled();
        });

        it("should throw an error if there is insufficient stock", async () => {
            const orderId = "order1";
            const orderProducts = [{ productId: 1, quantity: 15 }];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve([{ _id: 1, unitPrice: 1000, stock: 10, reservedStock: [] }])),
            } as any);
            const dropReservationsSpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await expect(reserveStock(orderId, orderProducts)).rejects.toThrow(`Insufficient stock for product id 1`);
            expect(dropReservationsSpy).toHaveBeenCalled();
        });
    });

    describe("rollbackSellProducts", () => {
        it("should rollback sold products by incrementing stock for each order product", async () => {
            const orderProducts = [
                { productId: 1, quantity: 5 },
                { productId: 2, quantity: 3 },
            ];
            const updateOneSpy = jest.spyOn(ProductModel, "updateOne").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await rollbackSellProducts(orderProducts);

            expect(updateOneSpy).toHaveBeenCalledTimes(orderProducts.length);
            expect(updateOneSpy).toHaveBeenCalledWith({ _id: 1 }, { $inc: { stock: 5 } });
            expect(updateOneSpy).toHaveBeenCalledWith({ _id: 2 }, { $inc: { stock: 3 } });
        });
    });
});
