import pool from "../config/db.js"; // Import the database connection pool
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

export const getAllGamesService = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    order = "DESC",
    search = "",
    releaseDateStart = "",
    releaseDateEnd = "",
  } = options;

  const offset = (page - 1) * limit;

  //validate sortBy and order inputs
  const validSortByFields = [
    "title",
    "release_date",
    "created_at",
    "platform",
    "genre",
    "publisher",
    "developer",
  ];
  const validOrder = ["ASC", "DESC"];
  const sortByField = validSortByFields.includes(sortBy.toLowerCase())
    ? sortBy.toLowerCase()
    : "created_at";
  const sortOrder = validOrder.includes(order.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  //creating the where conditions
  let whereConditions = [];
  let queryParams = [];
  let paramIndex = 1;

  //search by title, description, genre, platform
  if (search && search.trim()) {
    whereConditions.push(
      `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR genre ILIKE $${paramIndex} OR platform ILIKE $${paramIndex})`
    );
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  //release date range filter
  if (releaseDateStart) {
    whereConditions.push(`(release_date >= $${paramIndex})`);
    queryParams.push(releaseDateStart);
    paramIndex++;
  }
  if (releaseDateEnd) {
    whereConditions.push(`(release_date <= $${paramIndex})`);
    queryParams.push(releaseDateEnd);
    paramIndex++;
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*) FROM games
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, queryParams);
  const totalGames = parseInt(countResult.rows[0].count, 10);

  const mainQuery = `
    SELECT * FROM games
    ${whereClause}
    ORDER BY ${sortByField} ${sortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  queryParams.push(limit, offset);

  const result = await pool.query(mainQuery, queryParams);

  const totalPages = Math.ceil(totalGames / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    games: result.rows,
    pagination: {
      currentPage: page,
      totalPages,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
    filters: {
      sortBy: sortByField,
      order: sortOrder,
      search: search.trim() || "",
      releaseDateStart: releaseDateStart || null,
      releaseDateEnd: releaseDateEnd || null,
    },
  };
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
