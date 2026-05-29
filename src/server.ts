import express from 'express';
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/authRoutes";
import { connectDB } from './config/database';
import morgan from "morgan";
import cors from "cors";
import blogRoutes from './routes/blogRoutes';

dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies in requests
app.use(morgan("dev")); // Middleware for logging HTTP requests
app.use(cors());

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        message: "hello world"
    });
});

// When someone visits /docs, show Swagger API documentation UI.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// register middleware to parse JSON bodies in requests (e.g., for POST /api/auth/register)
app.use("/api/auth", authRoutes);
// Register blog routes under /api/blogs path
app.use("/api/blogs", blogRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 

// call the database connection function to connect to MongoDB
connectDB().catch((error) => {
    console.error("Failed to connect to database:", error);
});