import { Router } from "express";
import {registerUser , loginUser} from "../controllers/authControllers"

const router = Router();

/**
 * Swagger/OpenAPI documentation for Register API
 *
 * @openapi
 * /api/auth/register:
 *   post:
 *
 *     # Short summary shown in Swagger UI
 *     summary: Register a new user
 *
 *     # Group this API under "Auth" section
 *     tags: [Auth]
 *
 *     # Request body configuration
 *     requestBody:
 *
 *       # Request body is mandatory
 *       required: true
 *
 *       # Supported content type
 *       content:
 *         application/json:
 *
 *           # Schema of request body
 *           schema:
 *             type: object
 *
 *             # Required fields
 *             required: [name, email, password]
 *
 *             # Body properties
 *             properties:
 *
 *               # User name
 *               name:
 *                 type: string
 *
 *               # User email
 *               email:
 *                 type: string
 *
 *               # User password
 *               password:
 *                 type: string
 *
 *     # Possible API responses
 *     responses:
 *
 *       # Success response
 *       201:
 *         description: Created
 *
 *       # Validation failure
 *       400:
 *         description: Missing fields
 *
 *       # Duplicate email
 *       409:
 *         description: Email already registered
 */

// Route:
// POST /api/auth/register
//
// Calls register controller when user registration request comes
router.post("/register",registerUser);


/**
 * Swagger/OpenAPI documentation for Login API
 *
 * @openapi
 * /api/auth/login:
 *   post:
 *
 *     # Short API description
 *     summary: Login a user
 *
 *     # Group under Auth section
 *     tags: [Auth]
 *
 *     # Request body configuration
 *     requestBody:
 *
 *       # Body is required
 *       required: true
 *
 *       # JSON request format
 *       content:
 *         application/json:
 *
 *           # Request schema
 *           schema:
 *             type: object
 *
 *             # Mandatory fields
 *             required: [email, password]
 *
 *             # Request body properties
 *             properties:
 *
 *               # User email
 *               email:
 *                 type: string
 *
 *               # User password
 *               password:
 *                 type: string
 *
 *     # API responses
 *     responses:
 *
 *       # Successful login
 *       200:
 *         description: OK
 *
 *       # Invalid credentials
 *       401:
 *         description: Invalid credentials
 */

// Route:
// POST /api/auth/login
//
// Calls login controller for authentication
router.post("/login",loginUser);

export default router;