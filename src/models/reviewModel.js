import pool from "../config/db.js"; // Import the database connection pool
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

export const getAllReviewsService = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    order = "DESC",
    search = "",
    rating = "",
    gameId = "",
    userId = "",
    startDate = "",
    endDate = "",
  } = options;

  const offset = (page - 1) * limit;

  //validate sortBy and order inputs
  const validSortByFields = [
    "id",
    "title",
    "rating",
    "created_at",
    "updated_at",
    "username",
    "user_email",
    "game_title",
  ];
  const validOrder = ["ASC", "DESC"];
  const sortByField = validSortByFields.includes(sortBy.toLowerCase())
    ? sortBy.toLowerCase()
    : "created_at";
  const sortOrder = validOrder.includes(order.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  //building the where conditions
  let whereConditions = [];
  let queryParams = []; //keep track of the actual values for the parameterized queries
  let paramIndex = 1; // to keep track of the parameter index for parameterized queries - so $1 for first param, $2 for second, etc.

  //search by title, content, username or game title
  if (search && search.trim()) {
    whereConditions.push(
      `(r.title ILIKE $${paramIndex} OR r.content ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex} OR g.title ILIKE $${paramIndex})`
    );
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  //filter by rating - match or range
  if (rating && rating.trim()) {
    if (rating.includes("-")) {
      // range
      const [minRating, maxRating] = rating
        .split("-")
        .map((r) => parseInt(r.trim()));
      if (minRating && maxRating && minRating <= maxRating) {
        whereConditions.push(
          `r.rating >= $${paramIndex} AND r.rating <= $${paramIndex + 1}`
        );
        queryParams.push(minRating, maxRating);
        paramIndex += 2; // Increment by 2 for both min and max rating
      }
    } else {
      //exact match
      const ratingValue = parseInt(rating.trim());
      if (ratingValue >= 1 && ratingValue <= 5) {
        whereConditions.push(`r.rating = $${paramIndex}`);
        queryParams.push(ratingValue);
        paramIndex++;
      }
    }
  }

  //game ID filter
  if (gameId && gameId.trim()) {
    whereConditions.push(`r.game_id = $${paramIndex}`);
    queryParams.push(gameId.trim());
    paramIndex++;
  }

  //user ID filter
  if (userId && userId.trim()) {
    whereConditions.push(`r.user_id = $${paramIndex}`);
    queryParams.push(userId.trim());
    paramIndex++;
  }

  //date range filter
  if (startDate) {
    whereConditions.push(`r.created_at >= $${paramIndex}`);
    queryParams.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    whereConditions.push(`r.created_at <= $${paramIndex}`);
    queryParams.push(endDate);
    paramIndex++;
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  //base query with joins
  const baseQuery = `FROM reviews r JOIN users u ON r.user_id = u.id JOIN games g ON r.game_id = g.id ${whereClause}`;

  // Map sortBy fields to actual column names for complex joins
  const sortMapping = {
    id: "r.id",
    title: "r.title",
    rating: "r.rating",
    created_at: "r.created_at",
    updated_at: "r.updated_at",
    username: "u.username",
    user_email: "u.email",
    game_title: "g.title",
  };

  // FIX 1: Use sortByField instead of validSortByFields
  const actualSortBy = sortMapping[sortByField] || "r.created_at";

  // FIX 2: Count query needs the same JOINs as the main query when using search
  const countQuery = `SELECT COUNT(*) ${baseQuery}`;
  const countResult = await pool.query(countQuery, queryParams);
  const totalReviews = parseInt(countResult.rows[0].count);

  //final query to fetch reviews with pagination and sorting
  const mainQuery = `SELECT r.id, r.title, r.content, r.rating, r.created_at, r.updated_at, u.username, u.email as user_email, g.title as game_title, g.genre as game_genre, g.platform as game_platform ${baseQuery} ORDER BY ${actualSortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${
    paramIndex + 1
  }`;
  queryParams.push(limit, offset);

  const result = await pool.query(mainQuery, queryParams);

  //create some pagination metadata to return
  const totalPages = Math.ceil(totalReviews / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    reviews: result.rows,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
    filters: {
      sortBy: sortByField,
      order: sortOrder,
      search: search.trim() || null,
      rating: rating || null,
      gameId: gameId || null,
      userId: userId || null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
  };
};

export const getReviewByIdService = async (id) => {
  const result = await pool.query(
    "SELECT  r.id, r.title, r.content, r.rating, r.created_at, r.user_id, u.email as user_email, g.title as game_title, g.genre as game_genre, g.platform as game_platform FROM reviews r JOIN users u ON r.user_id = u.id JOIN games g ON r.game_id = g.id WHERE r.id = $1",
    [id]
  );
  return result.rows[0];
};

export const getReviewsByGameIdService = async (game_id, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    order = "DESC",
  } = options;

  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM reviews WHERE game_id = $1",
    [game_id]
  );
  const totalReviews = parseInt(countResult.rows[0].count);

  // Validate sorting
  const allowedSortFields = [
    "id",
    "title",
    "rating",
    "created_at",
    "updated_at",
    "username",
  ];
  const validSortBy = allowedSortFields.includes(sortBy.toLowerCase())
    ? sortBy
    : "created_at";
  const validOrder = ["ASC", "DESC"].includes(order.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  const sortMapping = {
    username: "u.username",
    id: "r.id",
    title: "r.title",
    rating: "r.rating",
    created_at: "r.created_at",
    updated_at: "r.updated_at",
  };

  const actualSortBy = sortMapping[validSortBy] || "r.created_at";

  const result = await pool.query(
    `SELECT 
      r.id, r.title, r.content, r.rating, r.created_at, r.updated_at,
      u.username, u.email as user_email
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.game_id = $1
    ORDER BY ${actualSortBy} ${validOrder}
    LIMIT $2 OFFSET $3`,
    [game_id, limit, offset]
  );

  const totalPages = Math.ceil(totalReviews / limit);

  return {
    reviews: result.rows,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getReviewsByUserIdService = async (user_id, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    order = "DESC",
  } = options;

  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM reviews WHERE user_id = $1",
    [user_id]
  );
  const totalReviews = parseInt(countResult.rows[0].count);

  // Validate sorting
  const allowedSortFields = [
    "id",
    "title",
    "rating",
    "created_at",
    "updated_at",
    "game_title",
  ];
  const validSortBy = allowedSortFields.includes(sortBy.toLowerCase())
    ? sortBy
    : "created_at";
  const validOrder = ["ASC", "DESC"].includes(order.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  const sortMapping = {
    game_title: "g.title",
    id: "r.id",
    title: "r.title",
    rating: "r.rating",
    created_at: "r.created_at",
    updated_at: "r.updated_at",
  };

  const actualSortBy = sortMapping[validSortBy] || "r.created_at";

  const result = await pool.query(
    `SELECT 
      r.id, r.title, r.content, r.rating, r.created_at, r.updated_at,
      g.title as game_title, g.genre as game_genre, g.platform as game_platform
    FROM reviews r 
    JOIN games g ON r.game_id = g.id 
    WHERE r.user_id = $1
    ORDER BY ${actualSortBy} ${validOrder}
    LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  );

  const totalPages = Math.ceil(totalReviews / limit);

  return {
    reviews: result.rows,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
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
