// Import types only (no runtime cost)
import type { Request, Response } from 'express';

// Import libraries for hashing passwords and generating JWT tokens
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Import User model (used to interact with MongoDB)
import User from '../models/User';



/**
 * REGISTER USER
 * Handles user signup:
 * 1. Validate input
 * 2. Check if user already exists
 * 3. Hash password
 * 4. Store user in DB
 * 5. Generate JWT token
 * 6. Send response
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        // Extract user input from request body
        const { name, email, password } = req.body as {
            name: string;
            email: string;
            password: string;
        };

        // Basic validation: ensure all fields are present
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if a user with this email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            // 409 = conflict (resource already exists)
            return res.status(409).json({ message: "Email already registered" });
        }

        // Hash the password before storing (never store plain password)
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user document in MongoDB
        const user = await User.create({ name, email, passwordHash });

        // Get JWT secret from environment variables
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not defined");
        }

        // Generate JWT token (used for authentication)
        const token = jwt.sign(
            { userId: String(user._id) }, // payload → identifies user
            secret,                       // secret → used for signing
            { expiresIn: "7d" }           // token validity
        );

        // Send success response
        return res.status(201).json({
            token,
            user: {
                id: String(user._id),
                name,
                email
            }
        });

    } catch (error) {
        // Log actual error for debugging
        console.error("Register error:", error);

        // Send generic error to client
        return res.status(500).json({ message: "Registration Failed" });
    }
};



/**
 * LOGIN USER
 * Handles user login:
 * 1. Validate input
 * 2. Check if user exists
 * 3. Compare password with hashed password
 * 4. Generate JWT token
 * 5. Send response
 */
export const loginUser = async (req: Request, res: Response) => {
    try {
        // Extract credentials from request body
        const { email, password } = req.body as {
            email: string;
            password: string;
        };

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user in database by email
        const user = await User.findOne({ email });

        // If user not found → invalid credentials
        if (!user) {
            return res.status(401).json({ message: "Invalid Login Credentials" });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        // If password does not match → invalid credentials
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Login Credentials" });
        }

        // Get JWT secret
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not defined");
        }

        // Generate token
        const token = jwt.sign(
            {
                userId: String(user._id),
                name: user.name,
                email: user.email
            },
            secret,
            { expiresIn: "7d" }
        );

        // Send success response (200 = OK)
        return res.status(200).json({
            token,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Login Failed" });
    }
};



