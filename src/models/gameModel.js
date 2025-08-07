import pool from "../config/db.js"; // Import the database connection pool
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

export const getAllGamesService = async () => {
  const result = await pool.query(
    "SELECT * FROM games ORDER BY created_at DESC"
  ); // Fetch all games ordered by creation date (newest first)
  return result.rows; // Return all games from the games table
};

export const getGameByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM games WHERE id = $1", [id]);
  return result.rows[0]; // Return the first game with the specified id
};

export const getGamesByGenreService = async (genre) => {
  const result = await pool.query(
    "SELECT * FROM games WHERE genre ILIKE $1 ORDER BY created_at DESC",
    [`%${genre}%`]
  );
  return result.rows; // Return all games with the specified genre
};

export const searchGamesService = async (searchTerm) => {
  // Use ILIKE for case-insensitive search in PostgreSQL
  const result = await pool.query(
    "SELECT * FROM games WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC",
    [`%${searchTerm}%`]
  );
  return result.rows; // Return all games that match the search term in title or description
};

export const createGameService = async (
  title,
  genre,
  description,
  developer,
  release_date,
  publisher,
  platform,
  image_url
) => {
  const result = await pool.query(
    "INSERT INTO games (title, description, genre, developer, release_date, publisher, platform, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [
      title,
      description,
      genre,
      developer,
      release_date,
      publisher,
      platform,
      image_url,
    ]
  );
  return result.rows[0]; // Return the newly created game
};

export const updateGameService = async (
  id,
  title,
  genre,
  description,
  developer,
  release_date,
  publisher,
  platform,
  image_url
) => {
  const result = await pool.query(
    "UPDATE games SET title = $1, genre = $2, description = $3, developer = $4, release_date = $5, publisher = $6, platform = $7, image_url = $8, updated_at = NOW() WHERE id = $9 RETURNING *",
    [
      title,
      genre,
      description,
      developer,
      release_date,
      publisher,
      platform,
      image_url,
      id,
    ]
  );
  return result.rows[0]; // Return the updated game
};

export const deleteGameService = async (id) => {
  const result = await pool.query(
    "DELETE FROM games WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0]; // Return the deleted game
};
