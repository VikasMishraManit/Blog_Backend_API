import mongoose, { Schema, Document, Model, Types } from "mongoose";

// TypeScript interface defining the shape of a Blog document
export interface IBlog extends Document {
  title: string;              // Blog title
  content: string;            // Main blog content
  imageUrl?: string;          // Optional image URL
  author: Types.ObjectId;     // Reference to User document
  createdAt: Date;            // Auto-generated creation timestamp
  updatedAt: Date;            // Auto-generated update timestamp
}

// Define MongoDB schema for Blog collection
const BlogSchema: Schema<IBlog> = new Schema<IBlog>(
  {
    // Blog title field
    title: {
      type: String,
      required: true, // Title is mandatory
      trim: true,     // Removes leading/trailing spaces
    },

    // Blog content field
    content: {
      type: String,
      required: true, // Content is mandatory
    },

    // Optional blog image
    imageUrl: {
      type: String,
    },

    // Reference to the user who created the blog
    author: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId
      ref: "User",                 // Reference to User model
      required: true,              // Every blog must have an author
      index: true,                 // Improves query performance
    },
  },

  // Automatically adds createdAt and updatedAt fields
  {
    timestamps: true,
  }
);

// Create/reuse Blog model
// Prevents model overwrite errors during hot reloads
export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

// Default export for easier imports
export default Blog;