import {
  createGameService,
  getAllGamesService,
  getGameByIdService,
  getGamesByGenreService,
  updateGameService,
  deleteGameService,
} from "../models/gameModel.js";
import { handleResponse, isValidDate } from "../utils/helpers.js";

export const createGame = async (req, res, next) => {
  const {
    title,
    genre,
    description,
    developer,
    release_date,
    publisher,
    platform,
    image_url,
  } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;
  if (!userId || userRole !== "admin") {
    return handleResponse(res, 403, "Only admins can create games");
  }

  try {
    const newGame = await createGameService(
      title,
      genre,
      description,
      developer,
      release_date,
      publisher,
      platform,
      image_url
    );
    return handleResponse(res, 201, "Game created successfully", newGame);
  } catch (error) {
    next(error);
  }
};

export const getAllGames = async (req, res, next) => {
  try {
    // Extract and validate pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Extract sorting parameters
    const sortBy = req.query.sortBy || "created_at";
    const order = req.query.order || "DESC";

    // Extract filtering parameters
    const search = req.query.search || "";
    const releaseDateStart = req.query.releaseDateStart || "";
    const releaseDateEnd = req.query.releaseDateEnd || "";

    // Validate pagination parameters
    if (page < 1) {
      return handleResponse(res, 400, "Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      return handleResponse(res, 400, "Limit must be between 1 and 100");
    }

    // Validate sortingg parameters
    const allowedSortFields = [
      "title",
      "release_date",
      "created_at",
      "platform",
      "genre",
      "publisher",
      "developer",
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

    // Validate release date formats
    if (releaseDateStart && !isValidDate(releaseDateStart)) {
      return handleResponse(res, 400, "Invalid releaseDateStart format");
    }

    if (releaseDateEnd && !isValidDate(releaseDateEnd)) {
      return handleResponse(res, 400, "Invalid releaseDateEnd format");
    }

    const options = {
      page,
      limit,
      sortBy: sortBy.toLowerCase(),
      order: order.toUpperCase(),
      search: search.trim() || "",
      releaseDateStart: releaseDateStart || null,
      releaseDateEnd: releaseDateEnd || null,
    };

    const result = await getAllGamesService(options);
    handleResponse(res, 200, "Games fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (req, res, next) => {
  try {
    const game = await getGameByIdService(req.params.id);
    if (!game) {
      return handleResponse(res, 404, "Game not found");
    }
    handleResponse(res, 200, "Game fetched successfully", game);
  } catch (error) {
    next(error);
  }
};

export const getGamesByGenre = async (req, res, next) => {
  const { genre } = req.params;

  try {
    // Extract and validate pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Extract sorting parameters
    const sortBy = req.query.sortBy || "created_at";
    const order = req.query.order || "DESC";

    // Validate pagination parameters
    if (page < 1) {
      return handleResponse(res, 400, "Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      return handleResponse(res, 400, "Limit must be between 1 and 100");
    }

    // Validate sortingg parameters
    const allowedSortFields = [
      "title",
      "release_date",
      "created_at",
      "platform",
      "genre",
      "publisher",
      "developer",
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

    const options = {
      page,
      limit,
      sortBy: sortBy.toLowerCase(),
      order: order.toUpperCase(),
    };

    const result = await getGamesByGenreService(genre, options);
    handleResponse(res, 200, "Games fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req, res, next) => {
  const {
    title,
    genre,
    description,
    developer,
    release_date,
    publisher,
    platform,
    image_url,
  } = req.body;
  const gameId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const existingGame = await getGameByIdService(gameId);
    if (!existingGame) {
      return handleResponse(res, 404, "Game not found");
    }

    if (!userId || userRole !== "admin") {
      return handleResponse(res, 403, "Only admins can update games");
    }

    const updatedGame = await updateGameService(
      gameId,
      title,
      genre,
      description,
      developer,
      release_date,
      publisher,
      platform,
      image_url
    );
    handleResponse(res, 200, "Game updated successfully", updatedGame);
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const gameId = req.params.id;

  try {
    const existingGame = await getGameByIdService(gameId);
    if (!existingGame) {
      return handleResponse(res, 404, "Game not found");
    }

    if (!userId || userRole !== "admin") {
      return handleResponse(res, 403, "Only admins can delete games");
    }

    const deletedGame = await deleteGameService(gameId);
    if (!deletedGame) {
      return handleResponse(res, 404, "Game not found");
    }
    handleResponse(res, 204, "Game deleted successfully", deletedGame);
  } catch (error) {
    next(error);
  }
};
