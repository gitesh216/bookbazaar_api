import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { db } from "../libs/db.js";

const getAllCartItems = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    const cartItems = await db.cartItem.findMany({
        where: {
            userId,
        },
        include: {
            book: true,
        },
    });

    if (cartItems.length === 0) {
        throw new ApiError(500, "Cart items not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, cartItems, "Cart items fetched successfully"),
        );
});

const addBookToCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookToAdd } = req.body;
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    if (!bookToAdd) {
        throw new ApiError(400, "Book data is required");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookToAdd?.bookId,
        },
    });
    if (!book) {
        throw new ApiError(400, "Requested book id not found");
    }

    if (bookToAdd.quantity > book.stock) {
        throw new ApiError(
            401,
            "The quantity of book exceed the available book stock",
        );
    }

    const result = await db.$transaction(async (tx) => {
        const book = await tx.book.findUnique({
            where: { id: bookToAdd.bookId },
        });
        if (!book) throw new ApiError(404, "Book not found");

        if (bookToAdd.quantity > book.stock) {
            throw new ApiError(400, "Quantity exceeds available stock");
        }

        const existingItem = await tx.cartItem.findUnique({
            where: { userId_bookId: { userId, bookId: bookToAdd.bookId } },
        });

        if (existingItem) {
            return await tx.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + bookToAdd.quantity },
            });
        }

        return await tx.cartItem.create({
            data: {
                bookId: bookToAdd.bookId,
                userId,
                quantity: bookToAdd.quantity,
            },
        });
    });
    return res
        .status(200)
        .json(new ApiResponse(200, result, "Book added to cart successfully"));
});

const updateCartQuantity = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookToAdd } = req.body;
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    if (!bookToAdd) {
        throw new ApiError(400, "Book data is required");
    }

    const updatedCartItem = await db.$transaction(async (tx) => {
        const book = await tx.book.findUnique({
            where: { id: bookToAdd.bookId },
        });
        if (!book) throw new ApiError(404, "Book not found");

        if (bookToAdd.quantity > book.stock) {
            throw new ApiError(400, "Quantity exceeds available stock");
        }

        const cartItem = await tx.cartItem.findUnique({
            where: { userId_bookId: { userId, bookId: bookToAdd.bookId } },
        });
        if (!cartItem) throw new ApiError(404, "Cart item not found");

        return await tx.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: bookToAdd.quantity },
        });
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                updatedCartItem,
                "Cart item updated successfully",
            ),
        );
});

const removeBook = asyncHandler(async (req, res) => {
    const { cartId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    if (!cartId) {
        throw new ApiError(400, "Cart ID is required");
    }

    const cartItem = await db.cartItem.findUnique({
        where: {
            id: cartId,
        },
    });
    if (!cartItem || cartItem.userId !== userId) {
        throw new ApiError(403, "Cart item not found or Unauthorized request");
    }

    const deleteCart = await db.cartItem.delete({
        where: {
            id: cartId,
        },
    });
    if (!deleteCart) {
        throw new ApiError(500, "Error in deleting cart item");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deleteCart, "Cart item deleted succeessfully"),
        );
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const cartItem = await db.cartItem.findMany({
        where: {
            userId,
        },
    });
    if ((cartItem, length === 0)) {
        throw new ApiError(400, "Cart items not found");
    }

    const clearCart = await db.cartItem.deleteMany({
        where: {
            userId,
        },
    });
    if (!clearCart) {
        throw new ApiError(500, "Error in deleting the cart");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "User cart deleted successfully"));
});

export {
    addBookToCart,
    clearCart,
    removeBook,
    updateCartQuantity,
    getAllCartItems,
};
