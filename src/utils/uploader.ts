/**
 * File Purpose:
 * -------------
 * This file configures Multer, a middleware used for handling file uploads
 * in Express applications.
 *
 * Responsibilities:
 * 1. Create an "uploads" folder if it does not already exist.
 * 2. Configure where uploaded files should be stored.
 * 3. Configure how uploaded files should be named.
 * 4. Allow only image files to be uploaded.
 * 5. Restrict maximum file size to 5 MB.
 * 6. Export a ready-to-use Multer middleware that can be attached to routes.
 *
 * Example:
 *
 * router.post(
 *   "/blogs",
 *   upload.single("image"),
 *   createBlog
 * );
 *
 * When a user uploads an image:
 * - Multer extracts the file from the request
 * - Saves it in the uploads folder
 * - Makes file information available in req.file
 */

import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * process.cwd()
 * returns the current project root directory.
 *
 * Example:
 * /Users/vikas/Backend_API
 *
 * path.join() safely creates:
 *
 * /Users/vikas/Backend_API/uploads
 */
const uploadsDir = path.join(process.cwd(), "uploads");

/**
 * Check if uploads directory already exists.
 *
 * First application start:
 * uploads/ may not exist.
 *
 * So create it automatically.
 */
if (!fs.existsSync(uploadsDir)) {
  /**
   * recursive: true means:
   * create parent folders if needed.
   */
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Storage configuration tells Multer:
 *
 * 1. Where to save uploaded files.
 * 2. What filename to give them.
 */
const storage = multer.diskStorage({

  /**
   * destination()
   *
   * Called every time a file is uploaded.
   *
   * cb = callback
   *
   * cb(error, destinationPath)
   *
   * We tell Multer:
   * "Store all uploaded files inside uploadsDir"
   */
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },

  /**
   * filename()
   *
   * Called before saving the file.
   *
   * Responsible for generating a unique filename.
   *
   * Without this:
   *
   * image.png
   * image.png
   *
   * second upload would overwrite first upload.
   */
  filename: (_req, file, cb) => {

    /**
     * Generate unique identifier.
     *
     * Example:
     *
     * 1717001234567-938472193
     */
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    /**
     * Extract original file extension.
     *
     * photo.png -> .png
     * image.jpg -> .jpg
     */
    const ext = path.extname(file.originalname);

    /**
     * Final filename example:
     *
     * image-1717001234567-938472193.png
     *
     * file.fieldname usually comes from:
     *
     * upload.single("image")
     *
     * so fieldname = "image"
     */
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter function.
 *
 * Runs before saving file.
 *
 * Purpose:
 * Only allow image uploads.
 */
function imageFileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {

  /**
   * MIME type examples:
   *
   * image/png
   * image/jpeg
   * image/webp
   * application/pdf
   * text/plain
   *
   * Regex:
   *
   * /^image\//
   *
   * means:
   * string must start with "image/"
   */
  if (/^image\//.test(file.mimetype)) {

    /**
     * Accept upload.
     */
    cb(null, true);

  } else {

    /**
     * Reject upload.
     *
     * Example:
     * PDF, ZIP, EXE etc.
     */
    cb(new Error("Only image uploads are allowed"));
  }
}

/**
 * Create Multer middleware.
 */
export const upload = multer({

  /**
   * Use our custom storage configuration.
   */
  storage,

  /**
   * Validate uploaded files.
   */
  fileFilter: imageFileFilter,

  /**
   * Maximum file size:
   *
   * 5 * 1024 * 1024
   *
   * = 5 MB
   *
   * Prevents users from uploading huge files.
   */
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/**
 * Allows:
 *
 * import upload from "../config/multer";
 */
export default upload;