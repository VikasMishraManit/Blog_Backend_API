import { Router } from "express";

/**
 * Import controller functions.
 *
 * Controllers contain the actual business logic.
 */
import {
  createBlog,
  listBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController";

/**
 * Authentication middleware.
 *
 * Verifies JWT token and attaches req.userId.
 */
import { requireAuth } from "../middleware/auth";

/**
 * Multer upload middleware.
 *
 * Handles image uploads.
 */
import { upload } from "../utils/uploader";

/**
 * Create Express Router instance.
 *
 * Router allows grouping related routes.
 */
const router = Router();


/**
 * @openapi
 * /api/blogs:
 *   get:
 *     summary: List blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", listBlogs);

/**
 * @openapi
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get("/:id", getBlog);

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Create a blog (auth required)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, upload.single("image"), createBlog);

/**
 * @openapi
 * /api/blogs/{id}:
 *   patch:
 *     summary: Update a blog (auth required)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id", requireAuth, upload.single("image"), updateBlog);

/**
 * @openapi
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog (auth required)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", requireAuth, deleteBlog);

export default router;