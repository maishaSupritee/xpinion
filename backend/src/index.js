import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import errorHandling from "./middlewares/errorHandler.js"; // Import centralized error handling middleware
import createUserTable from "./data/createUserTable.js";
import authRoutes from "./routes/authRoutes.js";
import createReviewsTable from "./data/createReviewsTable.js";
import createGamesTable from "./data/createGamesTable.js";
import { runSeed } from "./scripts/seedData.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json()); // Parse JSON bodies

/* CORS - controls which browsers can call our API from a web page
CORS_ORIGIN is a comma separated list of allowed origins such as our frontend domain, localhost, api domain
!origin allows tools like POSTMAN/cURL
credentials: true -> allows cookies to be sent (Refresh tokens)
*/
const allowlist = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin/no-origin (curl/postman) and allowlisted origins
      if (!origin || allowlist.includes(origin)) return cb(null, true);
      cb(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

// cookie parser
app.set("trust proxy", 1); // trust first proxy - needed for secure cookies if behind proxy like in production
app.use(cookieParser());

// routes
app.use("/api", userRoutes); // Use user routes under /api path
app.use("/api/auth", authRoutes); // Use authentication routes under /auth path
app.use("/api/games", gameRoutes);
app.use("/api/reviews", reviewRoutes); // Use review routes under /reviews path

/* health check route - a tiny fast endpoint (no DB Access) for 
Render to check if our service is healthy */
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// error handling
app.use(errorHandling); // Centralized error handling middleware

// function to initialize database tables in corrrect order before starting server
const initializeTables = async () => {
  try {
    console.log("Initializing database tables...");
    await createUserTable();
    await createGamesTable();
    await createReviewsTable(); // depends on both users and games tables
    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database tables: ", error);
    process.exit(1); // Exit the process if table creation fails
  }
};

// test postgres connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()"); // Query to get the current database name
  res.send(`The database name is: ${result.rows[0].current_database}`);
});

// initialize the tables and start the server
const startServer = async () => {
  try {
    await initializeTables(); // Ensure tables are created before starting the server
    if (process.env.RUN_SEED_ON_START === "true") {
      // idempotent - safe to run multiple times
      // same as runSeed({closePool: false}) - we keep the pool running here
      // because the app runs after seeding using the same shared DB pool
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server: ", error);
    process.exit(1); // Exit the process if server startup fails
  }
};

startServer();
