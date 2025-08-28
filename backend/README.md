# 🎮 Xpinion – Video Game Review Platform API

Where your XP meets your opinion. 💬🎮

Xpinion is a REST API for managing users, games, and reviews.
It’s built with Node.js, Express, and PostgreSQL (in Docker) to provide secure, scalable, and easy-to-use endpoints for a game review platform.

## ✨ Features

- User Authentication & Authorization

  - JWT-based auth for secure login & registration
  - Public vs. protected routes

- Game Management

  - Create, update, delete, and search games by title, description, or genre
  - Fetch average rating per game

- Review Management

  - Submit, update, and delete reviews
  - Filter reviews by game or user

- Data Validation & Error Handling

  - Middleware validation for required fields, type checks, and value ranges
  - Centralized error handler for consistent JSON responses

- Security
  - Parameterized queries to prevent SQL injection
  - Secure password hashing with bcrypt

## 🚀 Getting Started

1. Clone the repo

```bash
    git clone git@github.com:maishaSupritee/xpinion.git
    cd xpinion
```

2. Set up environment variables in a .env file in the root directory

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

6. Populate the db with some sample data

```bash
    npm run seed
```

### Make sure the package.json has the scripts below:

```bash

  "scripts": {
    "dev": "nodemon src/index.js",
    "seed": "node src/scripts/seedData.js"
    }
```

# **Main Endpoints**

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| POST   | `/api/auth/signup`        | Register user   |
| POST   | `/api/auth/login`         | Login & get JWT |
| GET    | `/api/games/search/:term` | Search games    |
| GET    | `/api/games/genre/:genre` | Filter by genre |
| POST   | `/api/reviews` _(auth)_   | Create review   |
