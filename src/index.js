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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// routes
app.use("/api", userRoutes); // Use user routes under /api path
app.use("/api/auth", authRoutes); // Use authentication routes under /auth path
app.use("/api/games", gameRoutes);
app.use("/api/reviews", reviewRoutes); // Use review routes under /reviews path

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
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server: ", error);
    process.exit(1); // Exit the process if server startup fails
  }
};

startServer();
