# Job Tracking / Recruitment System API Documentation

## Overview

This document describes the API endpoints for the Job Tracking / Recruitment System.
The API is built with Express, MongoDB, JWT authentication, and role-based authorization.

Base URL: `http://localhost:5000/api`

Authentication uses Bearer JWT tokens for protected routes.

---

## Environment Variables

The application expects the following variables in `.env`:

- `PORT` - API port (default `5000`)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret used to sign JWTs
- `JWT_EXPIRES_IN` - access token expiry (default `7d`)
- `JWT_REFRESH_EXPIRES_IN` - refresh token expiry (default `30d`)
- `FRONTEND_URL` - frontend base URL for email links
- `EMAIL_SERVICE` or `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

---

## Authentication Endpoints

### Register

- Method: `POST`
- URL: `/api/auth/register`
- Body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "passwordConfirm": "Password123!",
    "role": "candidate"
  }
  ```
- Notes:
  - `role` is optional and may be `candidate`, `recruiter`, `hiring_manager`, or `admin`
  - The response includes an access token and user details

### Verify Email

- Method: `GET`
- URL: `/api/auth/verify-email/:token`
- Notes:
  - The user receives this token by email during registration

### Login

- Method: `POST`
- URL: `/api/auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- Response includes:
  - `token` - access JWT
  - `refreshToken` - refresh JWT

### Forgot Password

- Method: `POST`
- URL: `/api/auth/forgot-password`
- Body:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- Notes:
  - Sends a password reset email if the account exists

### Reset Password

- Method: `POST`
- URL: `/api/auth/reset-password/:token`
- Body:
  ```json
  {
    "password": "NewPassword123!",
    "passwordConfirm": "NewPassword123!"
  }
  ```
- Response includes new access and refresh tokens

### Refresh Token

- Method: `POST`
- URL: `/api/auth/refresh-token`
- Body:
  ```json
  {
    "refreshToken": "<your-refresh-token>"
  }
  ```
- Notes:
  - Returns a new access token and rotated refresh token

### Get Current User

- Method: `GET`
- URL: `/api/auth/me`
- Headers:
  - `Authorization: Bearer <token>`

### Update Profile

- Method: `PUT`
- URL: `/api/auth/profile`
- Headers:
  - `Authorization: Bearer <token>`
- Body examples:
  ```json
  {
    "name": "Jane Smith",
    "profile.phone": "+1987654321",
    "profile.location": "Seattle, WA",
    "profile.linkedin": "https://linkedin.com/in/janesmith",
    "profile.skills": ["Recruiting", "Interviewing"]
  }
  ```

### Logout

- Method: `POST`
- URL: `/api/auth/logout`
- Headers:
  - `Authorization: Bearer <token>`

---

## User Endpoints

### Get All Users

- Method: `GET`
- URL: `/api/users`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Search Candidates

- Method: `GET`
- URL: `/api/users/candidates`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Get User by ID

- Method: `GET`
- URL: `/api/users/:id`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Update User

- Method: `PUT`
- URL: `/api/users/:id`
- Roles: `admin`
- Body: same fields allowed for profile updates

### Toggle User Status

- Method: `PATCH`
- URL: `/api/users/:id/status`
- Roles: `admin`
- Body example:
  ```json
  {
    "isActive": false
  }
  ```

---

## Job Endpoints

### Get Jobs

- Method: `GET`
- URL: `/api/jobs`
- Notes:
  - Public endpoint for open job listings

### Get Job by ID

- Method: `GET`
- URL: `/api/jobs/:id`

### Create Job

- Method: `POST`
- URL: `/api/jobs`
- Roles: `recruiter`, `hiring_manager`, `admin`
- Body example:
  ```json
  {
    "title": "Software Engineer",
    "description": "Build and maintain recruitment systems.",
    "department": "Engineering",
    "location": "Remote",
    "type": "full-time",
    "salary": {
      "min": 60000,
      "max": 90000,
      "currency": "USD"
    },
    "requirements": ["JavaScript", "Node.js"],
    "responsibilities": ["Write APIs", "Collaborate with team"],
    "deadline": "2026-12-31T23:59:59.000Z"
  }
  ```

### Update Job

- Method: `PUT`
- URL: `/api/jobs/:id`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Delete Job

- Method: `DELETE`
- URL: `/api/jobs/:id`
- Roles: `admin`

---

## Application Endpoints

### Apply to Job

- Method: `POST`
- URL: `/api/applications/jobs/:jobId/apply`
- Roles: `candidate`
- Body example:
  ```json
  {
    "coverLetter": "I am excited to apply for this role because..."
  }
  ```

### Get My Applications

- Method: `GET`
- URL: `/api/applications/my-applications`
- Roles: `candidate`

### Get All Applications

- Method: `GET`
- URL: `/api/applications`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Get Application by ID

- Method: `GET`
- URL: `/api/applications/:id`
- Requires authentication

### Update Application Status

- Method: `PUT`
- URL: `/api/applications/:id/status`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Add Application Note

- Method: `POST`
- URL: `/api/applications/:id/notes`
- Roles: `recruiter`, `hiring_manager`, `admin`

---

## Interview Endpoints

### Schedule Interview

- Method: `POST`
- URL: `/api/interviews`
- Roles: `recruiter`, `hiring_manager`, `admin`
- Body example:
  ```json
  {
    "applicationId": "642f1d2e8ab4c3fcd1234567",
    "type": "video",
    "date": "2026-06-15T10:00:00.000Z",
    "duration": 60,
    "location": "Zoom",
    "interviewers": ["hr@example.com"]
  }
  ```

### Get All Interviews

- Method: `GET`
- URL: `/api/interviews`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Get My Interviews

- Method: `GET`
- URL: `/api/interviews/my-interviews`
- Roles: `candidate`

### Get Interview by ID

- Method: `GET`
- URL: `/api/interviews/:id`

### Update Interview

- Method: `PUT`
- URL: `/api/interviews/:id`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Submit Feedback

- Method: `POST`
- URL: `/api/interviews/:id/feedback`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Cancel Interview

- Method: `PATCH`
- URL: `/api/interviews/:id/cancel`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Reschedule Interview

- Method: `PATCH`
- URL: `/api/interviews/:id/reschedule`
- Roles: `recruiter`, `hiring_manager`, `admin`

---

## Offer Endpoints

### Create Offer

- Method: `POST`
- URL: `/api/offers`
- Roles: `recruiter`, `hiring_manager`, `admin`
- Body example:
  ```json
  {
    "applicationId": "642f1d2e8ab4c3fcd1234567",
    "salary": 85000,
    "currency": "USD",
    "startDate": "2026-07-01T00:00:00.000Z"
  }
  ```

### Get Offers

- Method: `GET`
- URL: `/api/offers`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Get Offer by ID

- Method: `GET`
- URL: `/api/offers/:id`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Update Offer

- Method: `PUT`
- URL: `/api/offers/:id`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Update Offer Status

- Method: `PATCH`
- URL: `/api/offers/:id/status`
- Roles: `recruiter`, `hiring_manager`, `admin`

### Withdraw Offer

- Method: `DELETE`
- URL: `/api/offers/:id`
- Roles: `recruiter`, `hiring_manager`, `admin`

---

## Postman Collection

The Postman collection is included at `JobTracking_ATS_API.postman_collection.json`.

---

## Notes

- Use `Authorization: Bearer <token>` for protected routes.
- Refresh tokens are used to request a new access token at `/api/auth/refresh-token`.
- If a user changes password, existing access tokens are invalidated.
