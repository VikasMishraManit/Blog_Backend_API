import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface: Defines the shape of a User document in TypeScript
 * - Used only for type safety (compile-time)
 * - Extends Document to include MongoDB fields like _id
 */
export interface Iuser extends Document {
    name: string;
    email: string; // ⚠️ typo → should be "email"
    passwordHash: string;
    updatedAt: Date;
    createdAt: Date;
}

/**
 * Schema: Defines how data will be stored in MongoDB
 * - Adds validation rules
 * - Maps fields → types
 */
const UserSchema: Schema<Iuser> = new Schema<Iuser>(
{
    // User's name
    name: { 
        type: String,        // must be string
        required: true,      // cannot be empty
        trim: true           // removes extra spaces
    },

    // User's email
    email: { 
        type: String,
        required: true,
        lowercase: true,     // converts to lowercase before saving
        unique: true,        // ensures no duplicate emails
        index: true          // creates DB index for faster queries
    },

    // Hashed password (never store plain password)
    passwordHash: { 
        type: String,
        required: true
    },

},
{
    timestamps: true // automatically adds createdAt & updatedAt
});

/**
 * Model: The interface to interact with MongoDB
 * - Used to perform CRUD operations
 * - Maps schema → actual collection
 */
export const User: Model<Iuser> = mongoose.model<Iuser>("User", UserSchema);

export default User;