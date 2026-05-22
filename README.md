# Job Tracking / Recruitment System API

A Node.js / Express recruitment tracking API for managing users, jobs, applications, interviews, and offers.

## Key Features

- Authentication and registration
- Role-based access control for candidates, recruiters, hiring managers, and admins
- Public job browsing
- Job posting, update, and deletion
- Candidate application submission and status tracking
- Interview scheduling, rescheduling, cancellation, and feedback
- Offer creation, update, withdrawal, and status management
- Health check and root status endpoints

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- Helmet, CORS, Morgan
- dotenv

## Prerequisites

- Node.js 18+ installed
- npm installed
- MongoDB connection string

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd JobTracking-RecuitmentSystem
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file at project root with:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=<your-secret>
```

4. Start the server:

```bash
npm run dev
```

The API should now be available at `http://localhost:5000`.

## Available Scripts

- `npm start` - Start the app with Node
- `npm run dev` - Start the app with nodemon for development

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `GET /auth/me` - Get current authenticated user
- `PUT /auth/profile` - Update current user profile
- `POST /auth/logout` - Logout current user

### Users

- `GET /users` - Get all users
- `GET /users/candidates` - Search candidate users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (admin only)
- `PATCH /users/:id/status` - Toggle user active/inactive status (admin only)

### Jobs

- `GET /jobs` - Get all open jobs
- `GET /jobs/:id` - Get job by ID
- `POST /jobs` - Create job posting
- `PUT /jobs/:id` - Update job posting
- `DELETE /jobs/:id` - Delete job posting

### Applications

- `POST /applications/jobs/:jobId/apply` - Apply to a job
- `GET /applications/my-applications` - Get current user's applications
- `GET /applications` - Get all applications
- `GET /applications/:id` - Get application by ID
- `PUT /applications/:id/status` - Update application status
- `POST /applications/:id/notes` - Add notes to an application

### Interviews

- `POST /interviews` - Schedule an interview
- `GET /interviews` - Get all interviews
- `GET /interviews/my-interviews` - Get candidate's interviews
- `GET /interviews/:id` - Get interview by ID
- `PUT /interviews/:id` - Update interview details
- `POST /interviews/:id/feedback` - Submit interview feedback
- `PATCH /interviews/:id/cancel` - Cancel interview
- `PATCH /interviews/:id/reschedule` - Reschedule interview

### Offers

- `POST /offers` - Create an offer
- `GET /offers` - Get all offers
- `GET /offers/:id` - Get offer by ID
- `PUT /offers/:id` - Update offer
- `PATCH /offers/:id/status` - Update offer status
- `DELETE /offers/:id` - Withdraw offer

## Postman Collection

A Postman collection is included at `JobTracking_ATS_API.postman_collection.json`.

## Project Structure

- `app.js` - Main Express app configuration
- `server.js` - Entry point that starts the server
- `src/config/db.js` - Database connection
- `src/routes/` - API route definitions
- `src/controllers/` - Route handlers
- `src/models/` - Mongoose models
- `src/middleware/` - Auth, role, and error middleware
- `src/validators/` - Request validation schemas
- `src/templates/` - Email templates
- `src/utils/` - Utility services

## Notes

- Ensure `JWT_SECRET` is defined in `.env` for secure authentication.
- Public endpoints include job listing and job detail retrieval.
- Protected routes require `Authorization: Bearer <token>` header.

## License

This project is provided as-is.
