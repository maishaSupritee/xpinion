import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// routes

// error handling

// running the server
app.listen(PORT, () => {
  console.log(`Server is running on http:localhost:${PORT}`);
});
