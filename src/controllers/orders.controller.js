import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { db } from "../libs/db.js";

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { items } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Oder items are required");
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
        const book = await db.book.findUnique({
            where: {
                id: item.bookId,
            },
        });
        if (!book) {
            throw new ApiError(404, `Book not found: ${item.bookId}`);
        }

        if (book.stock < item.quantity) {
            throw new ApiError(
                400,
                `Insufficient stock for book: ${item.bookId}`,
            );
        }

        await db.book.update({
            where: {
                id: item.bookId,
            },
            data: {
                stock: {
                    decrement: item.quantity,
                },
            },
        });

        const itemTotal = book.price * item.quantity;
        totalPrice += itemTotal;

        orderItems.push({
            bookId: item.bookId,
            quantity: item.quantity,
            price: itemTotal,
        });
    }

    const order = await db.order.create({
        data: {
            userId,
            totalPrice,
            items: {
                create: orderItems,
            },
        },
        include: {
            items: {
                include: {
                    book: true,
                },
            },
        },
    });

    if (!order) {
        throw new ApiError(500, "Failed to create order");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order created successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const orders = await db.order.findMany({
        where: {
            userId,
        },
        include: {
            items: {
                include: {
                    book: true,
                },
            },
            payment: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!orders) {
        throw new ApiError(500, "Failed to fetch orders");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const order = await db.order.findUnique({
        where: {
            id: orderId,
            userId,
        },
        include: {
            items: {
                include: {
                    book: true,
                },
            },
            payment: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.userId !== userId) {
        throw new ApiError(403, "You are not authorized to view this order");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully"));
});

export { createOrder, getAllOrders, getOrder };
