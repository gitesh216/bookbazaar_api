import { Router } from "express";
import { createOrder, getAllOrders, getOrder } from "../controllers/orders.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createOrder);
router.get("/", verifyJWT, getAllOrders);
router.get("/:orderId", verifyJWT, getOrder);

export default router;

/** 
🛒 Order Routes
POST /orders → Place an order
GET /orders → List user’s orders
GET /orders/:id → Order details
*/