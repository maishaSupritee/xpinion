import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByGameId,
  getReviewsByUserId,
  getAverageRatingByGameId,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { validateReviewInput } from "../middlewares/inputValidator.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

/** Public reads */
router.get("/", getAllReviews);
router.get("/game/:game_id", getReviewsByGameId);
router.get("/game/:game_id/average_rating", getAverageRatingByGameId);
router.get("/user/:user_id", getReviewsByUserId);
router.get("/:id", getReviewById);

/** Protected writes */
router.post("/", protect, validateReviewInput, createReview);
router.put("/:id", protect, validateReviewInput, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
