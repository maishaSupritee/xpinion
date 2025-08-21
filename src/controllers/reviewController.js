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
import { handleResponse, isValidDate } from "../utils/helpers.js";

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
    // Extract and validate pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Extract sorting parameters
    const sortBy = req.query.sortBy || "created_at";
    const order = req.query.order || "DESC";

    // Extract filtering parameters
    const search = req.query.search || "";
    const rating = req.query.rating || "";
    const gameId = req.query.gameId || "";
    const userId = req.query.userId || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    // Validate pagination parameters
    if (page < 1) {
      return handleResponse(res, 400, "Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      return handleResponse(res, 400, "Limit must be between 1 and 100");
    }

    // Validate sorting parameters
    const allowedSortFields = [
      "id",
      "title",
      "rating",
      "created_at",
      "updated_at",
      "username",
      "game_title",
      "user_email",
    ];
    if (!allowedSortFields.includes(sortBy.toLowerCase())) {
      return handleResponse(
        res,
        400,
        `Invalid sortBy field. Allowed fields: ${allowedSortFields.join(", ")}`
      );
    }

    if (!["ASC", "DESC"].includes(order.toUpperCase())) {
      return handleResponse(res, 400, "Order must be ASC or DESC");
    }

    // Validate rating filter
    if (rating) {
      if (rating.includes("-")) {
        const [minRating, maxRating] = rating
          .split("-")
          .map((r) => parseInt(r.trim()));
        if (
          !minRating ||
          !maxRating ||
          minRating < 1 ||
          maxRating > 5 ||
          minRating > maxRating
        ) {
          return handleResponse(
            res,
            400,
            "Invalid rating range. Use format like '3-5'"
          );
        }
      } else {
        const ratingValue = parseInt(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
          return handleResponse(res, 400, "Rating must be between 1 and 5");
        }
      }
    }

    // Validate date formats
    if (startDate && !isValidDate(startDate)) {
      return handleResponse(
        res,
        400,
        "Invalid startDate format. Use YYYY-MM-DD"
      );
    }

    if (endDate && !isValidDate(endDate)) {
      return handleResponse(res, 400, "Invalid endDate format. Use YYYY-MM-DD");
    }

    // Validate IDs
    if (gameId && (isNaN(parseInt(gameId)) || parseInt(gameId) < 1)) {
      return handleResponse(
        res,
        400,
        "Invalid gameId. Must be a positive integer"
      );
    }

    if (userId && (isNaN(parseInt(userId)) || parseInt(userId) < 1)) {
      return handleResponse(
        res,
        400,
        "Invalid userId. Must be a positive integer"
      );
    }

    // Build options object
    const options = {
      page,
      limit,
      sortBy: sortBy.toLowerCase(),
      order: order.toUpperCase(),
      search,
      rating,
      gameId,
      userId,
      startDate,
      endDate,
    };

    const result = await getAllReviewsService(options);
    handleResponse(res, 200, "Reviews fetched successfully", result);
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
    // Extract pagination and sorting parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "created_at";
    const order = req.query.order || "DESC";

    // Validate parameters
    if (page < 1) {
      return handleResponse(res, 400, "Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      return handleResponse(res, 400, "Limit must be between 1 and 100");
    }

    const options = { page, limit, sortBy, order };
    const result = await getReviewsByGameIdService(game_id, options);

    if (!result.reviews || result.reviews.length === 0) {
      return handleResponse(res, 404, "No reviews found for this game");
    }

    handleResponse(res, 200, "Reviews fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByUserId = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    // Extract pagination and sorting parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "created_at";
    const order = req.query.order || "DESC";

    // Validate parameters
    if (page < 1) {
      return handleResponse(res, 400, "Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      return handleResponse(res, 400, "Limit must be between 1 and 100");
    }

    const options = { page, limit, sortBy, order };
    const result = await getReviewsByUserIdService(user_id, options);

    if (!result.reviews || result.reviews.length === 0) {
      return handleResponse(res, 404, "No reviews found for this user");
    }

    handleResponse(res, 200, "Reviews fetched successfully", result);
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
