import express from "express";
import {
  createGame,
  getAllGames,
  getGameById,
  getGamesByGenre,
  searchGames,
  updateGame,
  deleteGame,
} from "../controllers/gameController.js";
import { validateGameInput } from "../middlewares/inputValidator.js";
import { protect, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllGames);
router.get("/:id", getGameById);
router.get("/genre/:genre", getGamesByGenre);
router.get("/search/:term", searchGames);

// Protected writes
router.post("/", protect, requireAdmin, validateGameInput, createGame);
router.put("/:id", protect, requireAdmin, validateGameInput, updateGame);
router.delete("/:id", protect, requireAdmin, deleteGame);

export default router;
