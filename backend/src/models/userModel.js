// will have the user model for user-related database operations
import pool from "../config/db.js"; // Import the database connection pool
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import bcrypt from "bcrypt";

export const getAllUsersService = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "id",
    order = "ASC",
    search = "",
    role = "",
    startDate = "",
    endDate = "",
  } = options;

  //0 index, offset is how many to skip
  const offset = (page - 1) * limit;

  //validate sortBy and order inputs to prevent SQL injection
  const validSortByFields = ["id", "username", "email", "role", "created_at"];
  const validOrder = ["ASC", "DESC"];
  const sortByField = validSortByFields.includes(sortBy.toLowerCase())
    ? sortBy.toLowerCase()
    : "id";
  const sortOrder = validOrder.includes(order.toUpperCase())
    ? order.toUpperCase()
    : "ASC";

  //building the where conditions
  let whereConditions = [];
  let queryParams = []; //keep track of the actual values for the parameterized queries
  let paramIndex = 1; // to keep track of the parameter index for parameterized queries - so $1 for first param, $2 for second, etc.

  //search by username or email
  if (search && search.trim()) {
    whereConditions.push(
      `(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
    );
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  //filter by role
  if (role && role.trim()) {
    whereConditions.push(`role = $${paramIndex}`);
    queryParams.push(role.trim());
    paramIndex++;
  }

  //date range filter
  if (startDate) {
    whereConditions.push(`created_at >= $${paramIndex}`);
    queryParams.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    whereConditions.push(`created_at <= $${paramIndex}`);
    queryParams.push(endDate);
    paramIndex++;
  }

  //building the where clause
  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  //total count with all filters applied
  const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
  const countResult = await pool.query(countQuery, queryParams); //pass the query params for parameterized query
  const totalUsers = parseInt(countResult.rows[0].count); //total number of users matching the filters

  //final query to fetch users with pagination and sorting
  const mainQuery = `SELECT id, username, email, role, created_at FROM users ${whereClause} ORDER BY ${sortByField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${
    paramIndex + 1
  }`;
  queryParams.push(limit, offset); //add limit and offset to the query params

  const result = await pool.query(mainQuery, queryParams);

  //create some pagination metadata to return
  const totalPages = Math.ceil(totalUsers / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    users: result.rows,
    pagination: {
      currentPage: page,
      totalUsers,
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
      search: search.trim() || null,
      role: role.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
  };
};

export const getUserByIdService = async (id) => {
  const result = await pool.query(
    "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
    [id]
  ); //can't pass id directly, use parameterized query to prevent SQL injection
  return result.rows[0]; // Return the first user with the specified id
};

// SAFE VERSION - for general use (NO PASSWORD)
export const getUserByEmailService = async (email) => {
  const result = await pool.query(
    "SELECT id, username, email, created_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

// AUTH VERSION - ONLY for authentication (includes password)
export const getUserByEmailForAuthService = async (email) => {
  const result = await pool.query(
    "SELECT id, username, email, password, role, created_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

export const createUserService = async (
  username,
  email,
  password,
  role = "user"
) => {
  // $1, $2, and $3 are placeholders for the values to be inserted
  // insert a new user with given username, email, and password and then return the user with all columns
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
  );
  const result = await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
    [username, email, hashedPassword, role]
  );
  return result.rows[0]; // Return the newly created user
};

export const updateUserService = async (
  id,
  username,
  email,
  password,
  role
) => {
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
  );
  const result = await pool.query(
    "UPDATE users SET username = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, username, email, role, created_at",
    [username, email, hashedPassword, role || "user", id]
  );
  return result.rows[0]; // Return the updated user
};

export const deleteUserService = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id, username, email, created_at",
    [id]
  );
  return result.rows[0]; // Return the deleted user
};
