import { Router } from "express";
import {
    addBookReview,
    getAllBookReviews,
    deleteBookReview,
} from "../controllers/reviews.controller.js";
import { verifyJWT, checkAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/book/:bookId", verifyJWT, addBookReview);
router.get("/book/:bookId", verifyJWT, getAllBookReviews);

router.delete("/book/:bookId", verifyJWT, checkAdmin, deleteBookReview);

export default router;

/*
✍️ Review Routes
POST /books/:bookId/reviews → Add review to a book
GET /books/:bookId/reviews → List reviews for a book
DELETE /reviews/:id → Delete review (owner only)
*/