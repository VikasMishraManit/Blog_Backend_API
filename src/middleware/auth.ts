import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to protect routes that require authentication.
 * Checks for a valid JWT token in the Authorization header.
 */

export interface AuthRequest extends Request {
    userId?: string; // Optional userId property added to Request   
}

// Middleware function to verify JWT token and extract user ID
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // "Get the Authorization header from the incoming HTTP request and store it in a variable called header."
        const header = req.headers['authorization'];
        
        // Check if Authorization header is present and starts with "Bearer "
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization header missing or malformed" });
        }
        
        // Extract token from header
        const token = header.split(" ")[1];
        // Get JWT secret from environment variables 
        const secret = process.env.JWT_SECRET;
        if (!secret) {
           return res.status(500).json({ message: "Internal Server Error" });
        }

        // Verify token and extract payload
        const payload = jwt.verify(token, secret) as { userId: string };
        // Attach userId to request object for use in controllers
        req.userId = payload.userId;
        
        // Call next middleware or route handler
        next();

    } catch (error) {
        console.error("JWT ERROR:", error);
   return res.status(401).json({
      message: "Invalid token"
   });
    }
}

export default requireAuth;