import pool from "../config/db.js";

const createUserTable = async () => {
  const queryText = `CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)`;

  try {
    await pool.query(queryText);
    console.log(
      "User table created successfully, if it does not already exist."
    );
  } catch (error) {
    console.error("Error creating user table: ", error);
  }
};

export default createUserTable;
