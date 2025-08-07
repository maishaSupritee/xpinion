// will have the user model for user-related database operations
import pool from "../config/db.js"; // Import the database connection pool
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import bcrypt from "bcrypt";

export const getAllUsersService = async () => {
  const result = await pool.query(
    "SELECT id, username, email, created_at FROM users" //don't want to expose password in the response
  );
  return result.rows; // Return all users from the users table
};

export const getUserByIdService = async (id) => {
  const result = await pool.query(
    "SELECT id, username, email, created_at FROM users WHERE id = $1",
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
    "SELECT id, username, email, password, created_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

export const createUserService = async (username, email, password) => {
  // $1, $2, and $3 are placeholders for the values to be inserted
  // insert a new user with given username, email, and password and then return the user with all columns
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
  );
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
    [username, email, hashedPassword]
  );
  return result.rows[0]; // Return the newly created user
};

export const updateUserService = async (id, username, email, password) => {
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
  );
  const result = await pool.query(
    "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id,username,email,created_at",
    [username, email, hashedPassword, id]
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
