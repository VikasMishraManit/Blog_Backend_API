// Import swagger-jsdoc library.
// This package reads your Swagger/OpenAPI configuration
// and generates API documentation automatically.
import swaggerJsdoc from "swagger-jsdoc";


// Configuration object for swagger-jsdoc
const options: swaggerJsdoc.Options = {

  // Main OpenAPI configuration
  definition: {

    // OpenAPI version being used
    openapi: "3.0.3",

    // Basic information about the API
    info: {

      // Name of the API shown in Swagger UI
      title: "Simple Blog API",

      // Current API version
      version: "1.0.0",

      // Short description about the project
      description: "A minimal CRUD API for users and blogs",
    },

    // Server where the API is running
    // Swagger will use this as the base URL
    servers: [
      { url: "http://localhost:3000" }
    ],

    // Reusable components used across the API
    components: {

      // Security configuration
      securitySchemes: {

        // Name of the authentication scheme
        bearerAuth: {

          // HTTP authentication type
          type: "http",

          // Using Bearer token authentication
          scheme: "bearer",

          // Token format is JWT
          bearerFormat: "JWT",
        },
      },
    },

    // Apply bearerAuth globally to all routes
    // This means protected APIs expect:
    // Authorization: Bearer <token>
    security: [{ bearerAuth: [] }],
  },

  // Files where Swagger will look for API annotations/comments
  // Usually route files contain Swagger documentation comments
  apis: ["src/routes/*.ts"],
};


// Generate Swagger specification JSON using the above config
export const swaggerSpec = swaggerJsdoc(options);


// Default export so it can be imported anywhere
export default swaggerSpec;