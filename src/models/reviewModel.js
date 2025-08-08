import pool from "../config/db.js"; // Import the database connection pool
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

export const getAllReviewsService = async () => {
  // Join reviews with users and games to get additional information
  const result = await pool.query(
    "SELECT r.id, r.title, r.content, r.rating, r.created_at, u.username , u.email as user_email, g.title as game_title, g.genre as game_genre, g.platform as game_platform FROM reviews r JOIN users u ON r.user_id = u.id JOIN games g ON r.game_id = g.id ORDER BY r.created_at DESC"
  );
  return result.rows; // Return all reviews from the reviews table
};

export const getReviewByIdService = async (id) => {
  const result = await pool.query(
    "SELECT  r.id, r.title, r.content, r.rating, r.created_at,  u.email as user_email, g.title as game_title, g.genre as game_genre, g.platform as game_platform FROM reviews r JOIN users u ON r.user_id = u.id JOIN games g ON r.game_id = g.id WHERE r.id = $1",
    [id]
  );
  return result.rows[0];
};

export const getReviewsByGameIdService = async (game_id) => {
  const result = await pool.query(
    `
    SELECT 
      r.id, r.title, r.content, r.rating, r.created_at, r.updated_at,
      u.username, u.email as user_email
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.game_id = $1
    ORDER BY r.created_at DESC
  `,
    [game_id]
  );
  return result.rows; // Return all reviews for the specified game
};

export const getReviewsByUserIdService = async (user_id) => {
  const result = await pool.query(
    "SELECT r.id, r.title, r.content, r.rating, r.created_at, r.updated_at, g.title as game_title, g.genre as game_genre, g.platform as game_platform FROM reviews r JOIN games g ON r.game_id = g.id WHERE r.user_id = $1 ORDER BY r.created_at DESC",
    [user_id]
  );
  return result.rows; // Return all reviews by the specified user
};

export const getAverageRatingByGameIdService = async (game_id) => {
  // Calculate the average rating and review count for a specific game
  // Use NUMERIC(10,2) to ensure the average rating is returned with two decimal places
  // COUNT(*) to get the total number of reviews for that game
  const result = await pool.query(
    "SELECT AVG(rating)::NUMERIC(10,2) as average_rating, COUNT(*) as review_count FROM reviews WHERE game_id = $1",
    [game_id]
  );
  return result.rows[0]; // Return the average rating and review count for the specified game
};

export const createReviewService = async (
  title,
  content,
  rating,
  user_id,
  game_id
) => {
  const result = await pool.query(
    "INSERT INTO reviews (title, content, rating, user_id, game_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [title, content, rating, user_id, game_id]
  );
  return result.rows[0]; // Return the newly created review
};

export const updateReviewService = async (
  id,
  title,
  content,
  rating,
  user_id,
  game_id
) => {
  const result = await pool.query(
    "UPDATE reviews SET title = $1, content = $2, rating = $3, updated_at = NOW() WHERE id = $4 AND user_id=$5 AND game_id=$6 RETURNING *",
    [title, content, rating, id, user_id, game_id]
  );
  return result.rows[0]; // Return the updated review
};

export const deleteReviewService = async (id) => {
  const result = await pool.query(
    "DELETE FROM reviews WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0]; // Return the deleted review
};
