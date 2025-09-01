# 🎮 Xpinion – Video Game Review Platform API

Where your XP meets your opinion. 💬🎮

Xpinion is a REST API for managing users, games, and reviews.
It’s built with Node.js, Express, and PostgreSQL (in Docker) to provide secure, scalable, and easy-to-use endpoints for a game review platform.

- Live API (Render): https://xpinion-backend.onrender.com
- Local API: http://localhost:5001
- Health check: GET /healthz → 200 ok

🧱 Tech Stack

- Node.js 20+, Express 5
- PostgreSQL (Docker local / managed in prod)
- pg, jsonwebtoken, bcrypt, joi, cors
- Render (Web Service + PostgreSQL) for deployment

## ✨ Features

- User Authentication & Authorization

  - JWT-based auth for secure login & registration
  - Public vs. protected routes via middleware

- Role-Based Access Control (RBAC)

  - Admin

    - Can create/update/delete any game.
    - Can update or delete any user or any review.
    - Cannot delete their own account (safety guard).

  - User

    - Can update/delete their own account.
    - Can create/update/delete their own reviews.

- Games

  - Create (admin), update (admin), delete (admin).
  - Get by ID / genre, list with search/genre filters, average rating per game.

- Reviews

  - Create/update/delete (owner), delete (admin).
  - List with filter, sort, and pagination (by gameId, userId, rating range, date range).

- Users

  - Public list with pagination/search.
  - Owner/admin protected updates & deletes.

- Database operations

  - Tables auto-create on server start.
  - Seed script runs (idempotent) to insert dummy data.
  - /healthz for uptime checks.

- Data Validation & Error Handling

  - Joi request validation.
  - Middleware validation for required fields, type checks, and value ranges
  - Centralized error handler for consistent JSON responses

- Security
  - Parameterized queries to prevent SQL injection
  - Secure password hashing with bcrypt
  - CORS allowlist for your frontend + localhost

## 🚀 Getting Started

1. Clone the repo

```bash
    git clone git@github.com:maishaSupritee/xpinion.git
    cd xpinion/backend
```

2. Set up environment variables in a .env file in /backend:

```bash
NODE_ENV=development
PORT=5001

# Local Database configuration
DB_USER="postgres"
DB_HOST="localhost"
DB_NAME="xpinion"
DB_PORT=5432
DB_PASSWORD="password"

# AUTH & SECURITY
BCRYPT_SALT_ROUNDS=10
JWT_SECRET="dev_super_secret_change_me"
JWT_EXPIRATION="24h"
CORS_ORIGIN=http://localhost:3000

# Seeding
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="AdminPassword123!"
RUN_SEED_ON_START=true
```

3. Install dependencies

```bash
    npm install
```

4. Start Postgres in Docker

```bash
    docker run --name xpinion-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

5. Start the API, which creates the tables automatically in the db

```bash
    npm run dev
```

6. Manual seed (optional)

```bash
    npm run seed
```

### Make sure the package.json has the scripts below:

```bash

  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "seed": "node src/scripts/seedData.js"
    }
```

# 🔐 Auth & Roles

**JWT Bearer: send Authorization: Bearer <token> for protected routes.**

Access rules summary:

| Resource | Public Read | Create                                           | Update         | Delete                                    |
| -------- | ----------- | ------------------------------------------------ | -------------- | ----------------------------------------- |
| Users    | list/get    | /users (public register) or /users/admin (admin) | Owner or Admin | Owner or Admin (Admin cannot delete self) |
| Games    | list/get    | Admin                                            | Admin          | Admin                                     |
| Reviews  | list/get    | Authenticated User                               | Owner          | Owner (Admin can delete any)              |

# 📚 API – Key Endpoints (selection)

Base URL:

- Local: http://localhost:5001/api
- Render: https://xpinion-backend.onrender.com

Auth

- POST /auth/signup
- POST /auth/login → { accessToken, user }

Users

- GET /users?search=&page=&limit=&sort=&order=
- GET /users/:id
- POST /users (public register)
- POST /users/admin (admin only)
- PUT /users/:id (owner/admin)
- DELETE /users/:id (owner/admin; admin cannot delete self)

Games

- GET /games?search=&genre=&page=&limit=&sort=&order=
- GET /games/:id
- POST /games (admin)
- PUT /games/:id (admin)
- DELETE /games/:id (admin)

Reviews

- GET /reviews?gameId=&userId=&rating=4-5&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=&limit=&sort=&order=
- GET /reviews/game/:game_id
- GET /reviews/user/:user_id
- GET /reviews/:id
- POST /reviews (auth; creates under token’s user_id)
- PUT /reviews/:id (owner)
- DELETE /reviews/:id (owner)
- DELETE /reviews/admin/:id (admin)
