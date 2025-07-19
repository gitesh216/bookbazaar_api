import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addBookToCart,
    clearCart,
    removeBook,
    updateCartQuantity,
    getAllCartItems
} from "../controllers/cart.controller.js"

const router = Router();

router.get("/", verifyJWT, getAllCartItems);
router.post("/", verifyJWT, addBookToCart);
router.patch("/:cartId", verifyJWT, updateCartQuantity);
router.delete("/remove/:cartId", verifyJWT, removeBook);
router.delete("/clear", verifyJWT, clearCart);

export default router;