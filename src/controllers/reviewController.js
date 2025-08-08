import {
  createReviewService,
  getAllReviewsService,
  getReviewByIdService,
  getReviewsByGameIdService,
  getReviewsByUserIdService,
  getAverageRatingByGameIdService,
  updateReviewService,
  deleteReviewService,
} from "../models/reviewModel.js";
import { handleResponse } from "../utils/responseHandler.js";

export const createReview = async (req, res, next) => {
  const { title, content, rating, user_id, game_id } = req.body;
  try {
    const newReview = await createReviewService(
      title,
      content,
      rating,
      user_id,
      game_id
    );
    return handleResponse(res, 201, "Review created successfully", newReview);
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await getAllReviewsService();
    handleResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const review = await getReviewByIdService(req.params.id);
    if (!review) {
      return handleResponse(res, 404, "Review not found");
    }
    handleResponse(res, 200, "Review fetched successfully", review);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByGameId = async (req, res, next) => {
  const { game_id } = req.params;
  try {
    const reviews = await getReviewsByGameIdService(game_id);
    if (!reviews || reviews.length === 0) {
      return handleResponse(res, 404, "No reviews found for this game");
    }
    handleResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByUserId = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const reviews = await getReviewsByUserIdService(user_id);
    if (!reviews || reviews.length === 0) {
      return handleResponse(res, 404, "No reviews found for this user");
    }
    handleResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

export const getAverageRatingByGameId = async (req, res, next) => {
  const { game_id } = req.params;
  try {
    const averageRating = await getAverageRatingByGameIdService(game_id);
    if (!averageRating) {
      return handleResponse(res, 404, "No reviews found for this game");
    }
    handleResponse(
      res,
      200,
      "Average rating fetched successfully",
      averageRating
    );
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  const { title, content, rating, user_id, game_id } = req.body;
  try {
    const updatedReview = await updateReviewService(
      req.params.id,
      title,
      content,
      rating,
      user_id,
      game_id
    );
    if (!updatedReview) {
      return handleResponse(res, 404, "Review not found");
    }
    handleResponse(res, 200, "Review updated successfully", updatedReview);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const deletedReview = await deleteReviewService(req.params.id);
    if (!deletedReview) {
      return handleResponse(res, 404, "Review not found");
    }
    handleResponse(res, 200, "Review deleted successfully", deletedReview);
  } catch (error) {
    next(error);
  }
};
