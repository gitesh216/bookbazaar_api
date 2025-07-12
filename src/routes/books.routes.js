import { Router } from "express";
import { checkAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addBook,
    updateBook,
    deleteBook,
    getAllBooks,
    getAllBooksPagination,
    getBookById,
} from "../controllers/books.controller.js";

const router = Router();

router.post("/add-book", verifyJWT, checkAdmin, addBook);
router.put("/update/:bookId", verifyJWT, checkAdmin, updateBook);
router.delete("/delete/:bookId", verifyJWT, checkAdmin, deleteBook);

router.get("/get-all-books", verifyJWT, getAllBooks);
router.get("/get-book/:bookId", verifyJWT, getBookById);

export default router;

/*
Book Routes
POST /books → Add a book (Admin only)
GET /books → List all books (public, supports filters)
GET /books/:id → Get book details
PUT /books/:id → Update book (Admin only)
DELETE /books/:id → Delete book (Admin only)
*/
