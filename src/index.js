import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandling from "./middlewares/errorHandler.js"; // Import centralized error handling middleware
import createUserTable from "./data/createUserTable.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// routes
app.use("/api", userRoutes); // Use user routes under /api path

// error handling
app.use(errorHandling); // Centralized error handling middleware

// create table before we start the server
createUserTable();

// test postgres connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()"); // Query to get the current database name
  res.send(`The database name is: ${result.rows[0].current_database}`);
});

// running the server
app.listen(PORT, () => {
  console.log(`Server is running on http:localhost:${PORT}`);
});
