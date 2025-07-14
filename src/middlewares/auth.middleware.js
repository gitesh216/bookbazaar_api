import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/async-handler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            throw new ApiError(401, "Unauthorized - No token provided");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in auth middleware: ", error);
        throw new ApiError(500, "Error in catch of auth middleware", error);
    }
});

const checkAdmin = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                role: true,
            },
        });
    
        if (!user || user.role !== "ADMIN") {
            throw new ApiError(403, "Access denied - Admin only");
        }
        next();
    } catch (error) {
        throw new ApiError(500, "Error in checkAdmin", error);
    }
});

export { verifyJWT, checkAdmin };
