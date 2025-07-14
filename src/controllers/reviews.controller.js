import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { db } from "../libs/db.js";

const addBookReview = asyncHandler(async(req, res) => {
    const { rating, comment } = req.body;
    const { bookId } = req.params;
    const userId = req.user?.id;
    if(!rating || !comment) {
        throw new ApiError(400, "All fields are required");
    }
    if(!bookId) {
        throw new ApiError(400, "Book ID is required");
    }
    if(!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        }
    });
    if(!book) {
        throw new ApiError(404, "Book not found");
    }

    const review = await db.review.create({
        data: {
            rating,
            comment,
            book: {
                connect: {
                    id: bookId,
                }
            },
            user: {
                connect: {
                    id: userId,
                }
            }
        }
    });
    if(!review) {
        throw new ApiError(500, "Error in adding review");
    }
    return res.status(201).json(
        new ApiResponse(201, review, "Review added successfully")
    );
});

const getAllBookReviews = asyncHandler(async(req, res) => {
    const { bookId } = req.params;
    if(!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    const reviews = await db.review.findMany({
        where: {
            bookId,
        }
    });
    if(!reviews) {
        throw new ApiError(404, "Reviews not found");
    }
    return res.status(200).json(
        new ApiResponse(200, reviews, "Reviews fetched successfully")
    );
});

const deleteBookReview = asyncHandler(async(req, res) => {
    const { bookId } = req.params;
    if(!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        }
    });
    if(!book) {
        throw new ApiError(404, "Book not found");
    }

    const review = await db.review.deleteMany({
        where: {
            bookId,
        }
    });
    if(!review) {
        throw new ApiError(500, "Error in deleting review");
    }
    return res.status(200).json(
        new ApiResponse(200, review, "Review deleted successfully")
    );
});

export {
    addBookReview,
    getAllBookReviews,
    deleteBookReview,
};