# Backend API

A small but complete blog backend written in TypeScript on top of Express and MongoDB. It handles user signup and login, JSON Web Token based authentication, blog CRUD with image uploads, and ships with interactive API docs out of the box. The codebase is small enough to read end to end in an evening, and structured enough to extend when you need to.

## What's inside

- A TypeScript Express server with a clean separation of routes, controllers, middleware, models, and config.
- A user system with bcrypt password hashing and JWT issued at signup and login.
- Blog endpoints that support creating, listing, fetching, updating, and deleting posts, each blog can carry an uploaded cover image.
- Image uploads handled by Multer, validated for image MIME types, capped at 5 MB, and stored in a local `uploads/` directory.
- A Mongoose connection helper that reconnects cleanly and handles graceful shutdown on Ctrl+C.
- Swagger UI documentation generated from JSDoc comments in the route files, so the docs never drift far from the code.

## Tech stack

- Node.js and Express 5
- TypeScript with strict mode enabled
- Mongoose 9 for MongoDB
- jsonwebtoken for auth tokens
- bcrypt for password hashing
- multer for multipart uploads
- swagger-jsdoc and swagger-ui-express for the live API docs
- morgan for request logging
- cors for cross-origin requests
- dotenv for environment variables
- nodemon and ts-node for the dev loop

## Project layout

```
.
├── src/
│   ├── server.ts                  # App entry, middleware wiring, route mounting
│   ├── config/
│   │   ├── database.ts            # MongoDB connection and graceful shutdown
│   │   └── swagger.ts             # OpenAPI spec generation
│   ├── controllers/
│   │   ├── authControllers.ts     # register and login
│   │   └── blogController.ts      # create, list, get, update, delete blogs
│   ├── middleware/
│   │   └── auth.ts                # JWT verification and AuthRequest typing
│   ├── models/
│   │   ├── User.ts                # User schema and IUser interface
│   │   └── Blogs.ts               # Blog schema and IBlog interface
│   ├── routes/
│   │   ├── authRoutes.ts          # /api/auth/register and /api/auth/login
│   │   └── blogRoutes.ts          # /api/blogs and /api/blogs/:id
│   └── utils/
│       └── uploader.ts            # Multer storage, filter, and 5 MB size cap
├── uploads/                       # Created on first upload, holds user images
├── .env                           # MONGODB_URI and JWT_SECRET
├── .gitignore
├── package.json
└── tsconfig.json
```

## Getting started

You'll need Node.js 18 or newer, a MongoDB instance, and a terminal.

1. Install dependencies.

```bash
npm install
```

2. Create a `.env` file at the project root with the following keys.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
```

3. Run the dev server. Nodemon watches for file changes and ts-node compiles TypeScript on the fly.

```bash
npm run dev
```

4. Open `http://localhost:3000` to see the welcome message, or `http://localhost:3000/docs` to browse the Swagger UI.

To build for production and run the compiled output:

```bash
npm run build
npm start
```

## API at a glance

The base URL is `http://localhost:3000`. All blog write operations expect a Bearer token in the `Authorization` header.

### Auth

| Method | Path | Description | Auth |
| - | - | - | - |
| POST | `/api/auth/register` | Create a new user, returns a JWT and the user record | No |
| POST | `/api/auth/login` | Exchange email and password for a JWT and the user record | No |

Register body:

```json
{
  "name": "Vikas",
  "email": "vikas@example.com",
  "password": "supersecret"
}
```

Login body:

```json
{
  "email": "vikas@example.com",
  "password": "supersecret"
}
```

Both responses look like this:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6834abc123...",
    "name": "Vikas",
    "email": "vikas@example.com"
  }
}
```

Tokens are signed with `JWT_SECRET` and expire after seven days.

### Blogs

| Method | Path | Description | Auth |
| - | - | - | - |
| GET | `/api/blogs` | List all blogs, newest first, with author populated | No |
| GET | `/api/blogs/:id` | Fetch a single blog by id | No |
| POST | `/api/blogs` | Create a blog with an optional cover image | Yes |
| PATCH | `/api/blogs/:id` | Update a blog you own | Yes |
| DELETE | `/api/blogs/:id` | Delete a blog you own | Yes |

Create and update accept `multipart/form-data` with `title`, `content`, and an optional `image` file. The image is stored under `uploads/` and exposed as `/uploads/<filename>`. The image field, title, and content are validated server side. Only the blog's author can patch or delete it, anyone else gets a 403.

Example create call with curl:

```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Authorization: Bearer YOUR_JWT_HERE" \
  -F "title=My first post" \
  -F "content=Hello, world." \
  -F "image=@./cover.png"
```

## How authentication works

The auth middleware looks for an `Authorization` header in the form `Bearer <token>`. It verifies the token with `JWT_SECRET`, extracts `userId`, and attaches it to the request as `req.userId`. Protected controllers read that field to know who is acting. If the header is missing, malformed, or the token is invalid, the middleware responds with 401 before the controller ever runs.

## How uploads work

Multer is configured with disk storage under `process.cwd()/uploads/`. The `uploads/` directory is created automatically on first import if it doesn't exist. Filenames are generated as `image-<timestamp>-<random>.<ext>` so collisions are practically impossible. The file filter rejects anything that does not start with `image/` in its MIME type, so PDFs and binaries are blocked at the gate. The 5 MB limit keeps the local filesystem from filling up on accident.

> The folder is served as static assets by the underlying Express app in production deployments, so image URLs returned in blog documents resolve to the file you uploaded.

## Data models

**User**

- `name` (string, required, trimmed)
- `email` (string, required, lowercased, unique, indexed)
- `passwordHash` (string, required, never the plain password)
- `createdAt` and `updatedAt` managed by Mongoose timestamps

**Blog**

- `title` (string, required, trimmed)
- `content` (string, required)
- `imageUrl` (string, optional, points at a file under `uploads/`)
- `author` (ObjectId reference to `User`, required, indexed)
- `createdAt` and `updatedAt` managed by Mongoose timestamps

## Scripts

| Script | What it does |
| - | - |
| `npm run dev` | Start the server with nodemon and ts-node, restarts on file changes |
| `npm run build` | Compile TypeScript to JavaScript in `dist/` |
| `npm start` | Run the compiled server from `dist/server.js` |

## Notes and gotchas

- The `.env` file in this repo holds real credentials. Rotate them and replace with your own before publishing.
- The `uploads/` folder is gitignored but will be created the first time the app starts a request that uploads a file.
- CORS is enabled with default settings, so any origin can hit the API. Tighten this in production.
- Error responses are intentionally generic on the client side (e.g. `Failed to create blog`) while the real error is logged on the server. Don't rely on the response body for debugging.

ct.
