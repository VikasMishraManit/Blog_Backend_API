/**
 * File Purpose:
 * -------------
 * This file contains all blog-related controller functions.
 *
 * Controllers are responsible for:
 * 1. Receiving requests from routes.
 * 2. Reading request data (body, params, files, user info).
 * 3. Performing business logic.
 * 4. Calling Mongoose models to interact with MongoDB.
 * 5. Returning HTTP responses.
 *
 * Routes -> Controllers -> Models -> MongoDB
 *
 * Example:
 *
 * POST /blogs
 *      ↓
 * createBlog()
 *      ↓
 * Blog.create()
 *      ↓
 * MongoDB
 */

import type { Response } from "express";
import Blog from "../models/Blogs";
import type { AuthRequest } from "../middleware/auth.js";

/**
 * CREATE BLOG
 *
 * Creates a new blog document in MongoDB.
 *
 * Expected:
 * - title
 * - content
 * - optional image
 *
 * User must be authenticated because
 * req.userId comes from requireAuth middleware.
 */
export async function createBlog(req: AuthRequest, res: Response) {
  try {

    /**
     * Read title and content from request body.
     *
     * Example:
     * {
     *   "title": "My Blog",
     *   "content": "Hello World"
     * }
     */
    const { title, content } = req.body as {
      title: string;
      content: string;
    };

    /**
     * Basic validation.
     *
     * Both fields are required.
     */
    if (!title || !content)
      return res.status(400).json({
        message: "Missing fields",
      });

    /**
     * If image was uploaded through Multer,
     * create image URL.
     *
     * req.file is added by Multer middleware.
     */
    const imageUrl =
      req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

    /**
     * Create new blog document.
     *
     * author comes from JWT token.
     *
     * req.userId was attached by requireAuth middleware.
     */
    const blog = await Blog.create({
      title,
      content,
      imageUrl,
      author: req.userId,
    });

    /**
     * 201 = Created successfully.
     */
    return res.status(201).json(blog);

  } catch (err) {

    /**
     * Unexpected server/database error.
     */
    return res.status(500).json({
      message: "Failed to create blog",
    });
  }
}

/**
 * LIST ALL BLOGS
 *
 * Returns all blogs from database.
 */
export async function listBlogs(
  _req: AuthRequest,
  res: Response
) {
  try {

    /**
     * Find all blogs.
     */
    const blogs = await Blog.find()

      /**
       * Replace author ObjectId with
       * actual user information.
       *
       * Before:
       * author: "6834abc..."
       *
       * After:
       * author: {
       *   name,
       *   email
       * }
       */
      .populate("author", "name email")

      /**
       * Sort newest blogs first.
       *
       * -1 = descending order
       */
      .sort({
        createdAt: -1,
      });

    return res.json(blogs);

  } catch (err) {
    return res.status(500).json({
      message: "Failed to list blogs",
    });
  }
}

/**
 * GET SINGLE BLOG
 *
 * Returns one blog by its ID.
 */
export async function getBlog(
  req: AuthRequest,
  res: Response
) {
  try {

    /**
     * Read blog id from URL.
     *
     * Example:
     * GET /blogs/123
     *
     * id = 123
     */
    const { id } = req.params as {
      id: string;
    };

    /**
     * Search database by id.
     */
    const blog = await Blog.findById(id)
      .populate("author", "name email");

    /**
     * Blog does not exist.
     */
    if (!blog)
      return res.status(404).json({
        message: "Not found",
      });

    return res.json(blog);

  } catch (err) {
    return res.status(500).json({
      message: "Failed to get blog",
    });
  }
}

/**
 * UPDATE BLOG
 *
 * Allows blog owner to edit blog.
 */
export async function updateBlog(
  req: AuthRequest,
  res: Response
) {
  try {

    /**
     * Read blog id from URL.
     */
    const { id } = req.params as {
      id: string;
    };

    /**
     * Find blog in database.
     */
    const blog = await Blog.findById(id);

    if (!blog)
      return res.status(404).json({
        message: "Not found",
      });

    /**
     * Authorization check.
     *
     * Only owner can edit blog.
     *
     * blog.author:
     * ObjectId
     *
     * req.userId:
     * string
     *
     * Convert ObjectId -> string before comparison.
     */
    if (blog.author.toString() !== req.userId)
      return res.status(403).json({
        message: "Forbidden",
      });

    /**
     * Read updated fields.
     */
    const { title, content } = req.body as {
      title?: string;
      content?: string;
    };

    /**
     * Update only fields that user provided.
     */
    if (typeof title === "string")
      blog.title = title;

    if (typeof content === "string")
      blog.content = content;

    /**
     * If new image uploaded,
     * replace image URL.
     */
    if (req.file)
      blog.imageUrl =
        `/uploads/${req.file.filename}`;

    /**
     * Save modified document.
     */
    await blog.save();

    return res.json(blog);

  } catch (err) {
    return res.status(500).json({
      message: "Failed to update blog",
    });
  }
}

/**
 * DELETE BLOG
 *
 * Allows owner to permanently
 * delete a blog.
 */
export async function deleteBlog(
  req: AuthRequest,
  res: Response
) {
  try {

    /**
     * Read blog id from URL.
     */
    const { id } = req.params as {
      id: string;
    };

    /**
     * Find blog first.
     */
    const blog = await Blog.findById(id);

    if (!blog)
      return res.status(404).json({
        message: "Not found",
      });

    /**
     * Only owner can delete.
     */
    if (blog.author.toString() !== req.userId)
      return res.status(403).json({
        message: "Forbidden",
      });

    /**
     * Delete document from database.
     */
    await blog.deleteOne();

    return res.json({
      message: "Deleted",
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete blog",
    });
  }
}

/**
 * Export all controller functions.
 */
export default {
  createBlog,
  listBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
};