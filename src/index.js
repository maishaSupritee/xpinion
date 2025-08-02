import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// routes

// error handling

// test postgres connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()"); // Query to get the current database name
  res.send(`The database name is: ${result.rows[0].current_database}`);
});

// running the server
app.listen(PORT, () => {
  console.log(`Server is running on http:localhost:${PORT}`);
});
