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

const router = express.Router();

router.post("/", validateGameInput, createGame);
router.get("/", getAllGames);
router.get("/:id", getGameById);
router.get("/genre/:genre", getGamesByGenre);
router.get("/search/:term", searchGames);
router.put("/:id", validateGameInput, updateGame);
router.delete("/:id", deleteGame);

export default router;
