/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    getAllProducts,
    createProduct,
    restockProduct,
    sellProduct,
    dropProductsReservationsForOrderId,
    reserveStock,
    rollbackSellProducts,
} from "../services/product.service";
import ProductModel from "../models/product.model";
import { toCents, fromCents } from "../utils/price";
import { omit } from "../utils/common";

jest.mock("../utils/db", () => ({
    findNextId: jest.fn().mockResolvedValue(1),
}));

describe("Product Service", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    const fakeProducts = [
        {
            _id: 1,
            name: "Product 1",
            description: "Product 1 description",
            unitPrice: 1000,
            stock: 50,
            reservedStock: [{ orderId: "order-example-id", quantity: 10 }],
        },
        {
            _id: 2,
            name: "Product 2",
            description: "Product 2 description",
            unitPrice: 2000,
            stock: 30,
            reservedStock: [],
        },
    ];

    const orderProducts = [
        { productId: 1, quantity: 5 },
        { productId: 2, quantity: 3 },
    ];

    describe("getAllProducts", () => {
        it("should return public products with transformed data", async () => {
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProducts)),
            } as any);

            const publicProducts = await getAllProducts();

            expect(publicProducts).toHaveLength(2);
            expect(publicProducts[0]).toMatchObject({
                name: "Product 1",
                description: "Product 1 description",
                unitPrice: fromCents(fakeProducts[0].unitPrice),
                stock: fakeProducts[0].stock - 10,
            });
            expect(publicProducts[1]).toMatchObject({
                name: "Product 2",
                description: "Product 2 description",
                unitPrice: fromCents(fakeProducts[1].unitPrice),
                stock: fakeProducts[1].stock,
            });
        });
    });

    describe("createProduct", () => {
        it("should create a product with a new id and converted unit price", async () => {
            const productData = { ...omit(fakeProducts[1], ["_id"]) };
            const createSpy = jest.spyOn(ProductModel, "create").mockResolvedValue({ _id: 1 } as any);

            await createProduct(productData);

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: 1,
                    name: "Product 2",
                    description: "Product 2 description",
                    unitPrice: toCents(productData.unitPrice),
                    stock: productData.stock,
                    reservedStock: [],
                }),
            );
        });
    });

    describe("restockProduct", () => {
        it("should update product stock by incrementing the quantity", async () => {
            const productId = 1;
            const quantity = 20;
            const updateSpy = jest.spyOn(ProductModel, "findByIdAndUpdate").mockResolvedValue({ stock: 70 });

            await restockProduct(productId, quantity);

            expect(updateSpy).toHaveBeenCalledWith(productId, { $inc: { stock: quantity } }, { new: true });
        });
    });

    describe("sellProduct", () => {
        it("should sell the product when enough stock is available", async () => {
            const quantity = 5;
            const fakeProduct = { ...fakeProducts[0], stock: 5, reservedStock: [] };
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);
            const updateSpy = jest.spyOn(ProductModel, "findByIdAndUpdate").mockResolvedValue({ stock: 5 });

            await sellProduct(fakeProduct["_id"], quantity, "order-example-id");

            expect(updateSpy).toHaveBeenCalledWith(fakeProduct["_id"], { $inc: { stock: -quantity } }, { new: true });
        });

        it("should throw an error if the product is not found", async () => {
            const productId = 42;
            const quantity = 5;
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(null)),
            } as any);

            await expect(sellProduct(productId, quantity, "order-example-id")).rejects.toThrow(`Product with ID ${productId} is unavailable`);
        });

        it("should throw an error if there is insufficient stock", async () => {
            const quantity = 6;

            const fakeProduct = { ...fakeProducts[0], stock: 5, reservedStock: [] };
            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);

            await expect(sellProduct(fakeProduct["_id"], quantity, "order-example-id")).rejects.toThrow(
                `Insufficient stock for product id ${fakeProduct["_id"]}`,
            );
        });

        it("should throw a concurrency error when reserved quantity exceeds stock", async () => {
            const quantity = 5;
            const fakeProduct = { ...fakeProducts[0], stock: 5 };

            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);

            await expect(sellProduct(fakeProduct["_id"], quantity, "order-example-id2")).rejects.toThrow("Concurrency error");
        });

        it("should allow transaction when enough stock is reserved", async () => {
            const quantity = 10;
            const fakeProduct = { ...fakeProducts[0], stock: 10 };

            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);

            const updateSpy = jest.spyOn(ProductModel, "findByIdAndUpdate").mockResolvedValue({ stock: 0 });

            await sellProduct(fakeProduct["_id"], quantity, fakeProduct.reservedStock[0].orderId);

            expect(updateSpy).toHaveBeenCalledWith(fakeProduct["_id"], { $inc: { stock: -quantity } }, { new: true });
        });

        it("should throw an error if there is insufficient stock because of reserved stock for other order id", async () => {
            const quantity = 10;
            const fakeProduct = { ...fakeProducts[0], stock: 10 };

            jest.spyOn(ProductModel, "findById").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve(fakeProduct)),
            } as any);

            await expect(sellProduct(fakeProduct["_id"], quantity, "order-example-id-2")).rejects.toThrow(
                `Insufficient stock for product id ${fakeProduct["_id"]}`,
            );
        });
    });

    describe("dropProductsReservationsForOrderId", () => {
        it("should drop reservations for the given order id", async () => {
            const orderId = "order-example-id";

            const updateManySpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await dropProductsReservationsForOrderId(orderId);

            expect(updateManySpy).toHaveBeenCalledWith({ "reservedStock.orderId": orderId }, { $pull: { reservedStock: { orderId } } });
        });
    });

    describe("reserveStock", () => {
        const orderId = "order-example-id";

        it("should reserve stock for each order product when enough stock exists", async () => {
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
            const orderProducts = [{ productId: 420, quantity: 5 }];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve([])),
            } as any);
            const dropReservationsSpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await expect(reserveStock(orderId, orderProducts)).rejects.toThrow(`Product with ID ${orderProducts[0].productId} is unavailable`);
            expect(dropReservationsSpy).toHaveBeenCalled();
        });

        it("should throw an error if there is insufficient stock", async () => {
            const orderProducts = [{ productId: 1, quantity: 15 }];
            jest.spyOn(ProductModel, "find").mockReturnValue({
                lean: jest.fn().mockReturnValue(Promise.resolve([{ _id: 1, unitPrice: 1000, stock: 10, reservedStock: [] }])),
            } as any);
            const dropReservationsSpy = jest.spyOn(ProductModel, "updateMany").mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

            await expect(reserveStock(orderId, orderProducts)).rejects.toThrow(`Insufficient stock for product id ${orderProducts[0].productId}`);
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
