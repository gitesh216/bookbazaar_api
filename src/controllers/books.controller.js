import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { db } from "../libs/db.js";

const addBook = asyncHandler(async (req, res) => {
    const { title, author, description, genre, price, stock } = req.body;

    if (!title || !author || !description || !genre || !price || !stock) {
        throw new ApiError(400, "All fields are required");
    }

    const newBook = await db.book.create({
        data: {
            title,
            author,
            description,
            genre,
            price,
            stock,
        },
    });

    if (!newBook) {
        throw new ApiError(500, "Error in adding book");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newBook, "Book added successfully"));
});

const updateBook = asyncHandler(async (req, res) => {
    const { title, author, description, genre, price, stock } = req.body;
    const { bookId } = req.params;

    if (!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    if (!title || !author || !description || !genre || !price || !stock) {
        throw new ApiError(400, "All fields are required");
    }

    const exisitingBook = await db.book.findUnique({
        where: {
            id: bookId,
        },
    });

    if (!exisitingBook) {
        throw new ApiError(404, "Book not found");
    }

    const updatedBook = await db.book.update({
        where: { id: bookId },
        data: {
            ...(title && { title }),
            ...(author && { author }),
            ...(description && { description }),
            ...(genre && { genre }),
            ...(price !== undefined && { price }),
            ...(stock !== undefined && { stock }),
        },
    });

    if (!updatedBook) {
        throw new ApiError(500, "Error in adding book");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, updatedBook, "Book added successfully"));
});

const deleteBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    const exisitingBook = await db.book.findUnique({
        where: {
            id: bookId,
        },
    });

    if (!exisitingBook) {
        throw new ApiError(404, "Book not found");
    }

    const deletedBook = await db.book.delete({
        where: {
            id: bookId,
        },
    });

    if (!deletedBook) {
        throw new ApiError(500, "Error in deleting book");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedBook, "Book deleted successfully"));
});

const getAllBooks = asyncHandler(async (req, res) => {
    const books = await db.book.findMany();
    if (!books) {
        throw new ApiError(500, "Error in fetching books");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, books, "Books fetched successfully"));
});

const getAllBooksPagination = asyncHandler(async (req, res) => {
    const {
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
    } = req.qeury;

    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = {
        OR: [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                author: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                genre: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ],
    };

    const books = await db.book.findMany({
        where: search ? whereClause : undefined,
        orderBy: {
            [sortBy]: sortOrder,
        },
        skip,
        take: Number(limit),
    });

    const totalBooks = await db.book.count({
        where: search ? whereClause : undefined,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                books,
                pagination: {
                    total: totalBooks,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalBooks / limit),
                },
            },
            "Books fetched successfully",
        ),
    );
});

const getBookById = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        throw new ApiError(400, "Book ID is required");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        },
    });
    if (!book) {
        throw new ApiError(404, "Book not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, book, "Book fetched successfully"));
});

export {
    addBook,
    updateBook,
    deleteBook,
    getAllBooks,
    getAllBooksPagination,
    getBookById,
};