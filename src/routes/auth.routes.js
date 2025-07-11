import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getApiKey,
    getProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/logout", verifyJWT, logoutUser);
router.post("/api-key", verifyJWT, getApiKey);
router.get("/profile", verifyJWT, getProfile);

export default router;
