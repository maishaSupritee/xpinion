import {
  createGameService,
  getAllGamesService,
  getGameByIdService,
  getGamesByGenreService,
  searchGamesService,
  updateGameService,
  deleteGameService,
} from "../models/gameModel.js";
import { handleResponse } from "../utils/responseHandler.js";

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
    const games = await getAllGamesService();
    handleResponse(res, 200, "Games fetched successfully", games);
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
    const games = await getGamesByGenreService(genre);
    if (!games || games.length === 0) {
      return handleResponse(res, 404, "Games not found");
    }
    handleResponse(res, 200, "Games fetched successfully", games);
  } catch (error) {
    next(error);
  }
};

export const searchGames = async (req, res, next) => {
  const { searchTerm } = req.params;
  try {
    const games = await searchGamesService(searchTerm);
    if (!games || games.length === 0) {
      return handleResponse(res, 404, "Games not found");
    }
    handleResponse(res, 200, "Games fetched successfully", games);
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
