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
  const { title, content, rating, game_id } = req.body;
  const user_id = req.user.id;

  if (!user_id) {
    return handleResponse(res, 400, "User ID is required to create a review");
  }

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
    console.log("Error in createReview:", error);
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

export const searchReviews = async (req, res, next) => {
  const { searchTerm } = req.query;
  try {
    const reviews = await searchReviewsService(searchTerm);
    if (!reviews || reviews.length === 0) {
      return handleResponse(
        res,
        404,
        "No reviews found matching the search term"
      );
    }
    handleResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  const { title, content, rating, game_id } = req.body;
  const reviewId = req.params.id;
  const userId = req.user.id;

  try {
    // check if the review exists and belongs to the user
    const existingReview = await getReviewByIdService(reviewId);
    if (!existingReview) {
      return handleResponse(res, 404, "Review not found");
    }
    // Check if the user owns this review (with type conversion to handle string/number mismatch)
    if (parseInt(existingReview.user_id) !== parseInt(userId)) {
      return handleResponse(res, 403, "You can only update your own reviews");
    }

    const updatedReview = await updateReviewService(
      reviewId,
      title,
      content,
      rating,
      userId,
      game_id
    );

    handleResponse(res, 200, "Review updated successfully", updatedReview);
  } catch (error) {
    console.log("Error in updateReview:", error);
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  try {
    // check if the review exists and belongs to the user
    const existingReview = await getReviewByIdService(reviewId);
    if (!existingReview) {
      return handleResponse(res, 404, "Review not found");
    }

    // Check if the user owns this review (with type conversion to handle string/number mismatch)
    if (parseInt(existingReview.user_id) !== parseInt(userId)) {
      return handleResponse(res, 403, "You can only delete your own reviews");
    }

    const deletedReview = await deleteReviewService(reviewId);
    handleResponse(res, 204, "Review deleted successfully", deletedReview);
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAsAdmin = async (req, res, next) => {
  const reviewId = req.params.id;

  try {
    const existingReview = await getReviewByIdService(reviewId);
    if (!existingReview) {
      return handleResponse(res, 404, "Review not found");
    }

    const deletedReview = await deleteReviewService(reviewId);
    handleResponse(
      res,
      204,
      "Review deleted successfully by admin",
      deletedReview
    );
  } catch (error) {
    next(error);
  }
};
