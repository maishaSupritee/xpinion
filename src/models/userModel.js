// will have the user model for user-related database operations
import pool from "../config/db.js"; // Import the database connection pool

export const getAllUsersService = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows; // Return all users from the users table
};

export const getUserByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]); //can't pass id directly, use parameterized query to prevent SQL injection
  return result.rows[0]; // Return the first user with the specified id
};

export const createUserService = async (name, email, password) => {
  // $1, $2, and $3 are placeholders for the values to be inserted
  // insert a new user with given name, email, and password and then return the user with all columns
  const result = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );
  return result.rows[0]; // Return the newly created user
};

export const updateUserService = async (id, name, email, password) => {
  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *",
    [name, email, password, id]
  );
  return result.rows[0]; // Return the updated user
};

export const deleteUserService = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0]; // Return the deleted user
};
