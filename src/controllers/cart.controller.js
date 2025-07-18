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
    });

    if (!cartItems) {
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
    if (!book) {
        throw new ApiError(400, "Book data is required");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookToAdd.bookId,
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

    const cartItem = await db.cartItem.findUnique({
        where: {
            userId,
            bookId: bookToAdd.bookId,
        },
    });

    if (cartItem) {
        await db.cartItem.update({
            quantity: cartItem.quantity + bookToAdd.quantity,
        });
    } else {
        const newCartItem = await db.cartItem.caret({
            data: {
                bookId: bookToAdd.bookId,
                userId,
                quantity: bookToAdd.quantity,
            },
        });
        if (!newCartItem) {
            throw new ApiError(500, "Error creating a new cart item");
        }
        return res
            .status(201)
            .json(
                new ApiResponse(201, newCartItem, "Cart created successfully"),
            );
    }
    return res
        .status(200)
        .json(new ApiResponse(200, cartItem, "Cart created succesfully"));
});

const updateCartQuantity = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookToAdd } = req.body;
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    if (!book) {
        throw new ApiError(400, "Book data is required");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookToAdd.bookId,
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

    const cartItem = await db.cartItem.findUnique({
        where: {
            userId,
            bookId: bookToAdd.bookId,
        },
    });

    if (!cartItem) {
        throw new ApiError(400, "Cart not found");
    }

    await db.cartItem.update({
        quantity: cartItem.quantity + bookToAdd.quantity,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, cartItem, "Cart item updated successfully"));
});

const removeBook = asyncHandler(async (req, res) => {
    const { cartId } = req.body;
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
    if (!cartItem) {
        throw new ApiError(400, "Cart item not found");
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
    if (!cartItem) {
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
        .json(
            new ApiResponse(200, clearCart, "User cart deleted successfully"),
        );
});

export {
    addBookToCart,
    clearCart,
    removeBook,
    updateCartQuantity,
    getAllCartItems
}
