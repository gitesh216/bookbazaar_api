import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { db } from "../libs/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    console.log(name, email, password);
    const user = await db.user.findUnique({
        where: {
            email,
        },
    });

    if (user) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    if (!newUser) {
        console.log(newUser);
        throw new ApiError(500, "Error in creating user", newUser);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ((!email, !password)) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await db.user.findUnique({ 
        where: { email }
    });
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Invalid credentials");
    }

    const token = jwt.sign(
        {
            id: user.id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
    );
    const cookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 days
    };
    res.cookie("token", token, cookieOptions);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Logout successfully"));
});

const getApiKey = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const user = await db.user.findUnique(
        { 
            where: { email }
        });
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const key = await crypto.randomBytes(16).toString("hex");
    if (!key) {
        throw new ApiError(500, "Error in generating API key");
    }

    const newApiKey = await db.apiKey.create({
        data: {
            key,
            userId: req.user.id,
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, newApiKey, "API key created successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, req.user, "User authenticated successfully"),
    );
});

export { registerUser, loginUser, logoutUser, getApiKey, getProfile };
