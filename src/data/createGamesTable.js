import pool from "../config/db.js";

const createGamesTable = async () => {
  const queryText = `CREATE TABLE IF NOT EXISTS games(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    developer VARCHAR(255),
    release_date DATE,
    publisher VARCHAR(255),
    platform VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)`;

  try {
    await pool.query(queryText);
    console.log(
      "Games table created successfully, if it does not already exist."
    );
  } catch (error) {
    console.error("Error creating games table: ", error);
  }
};

export default createGamesTable;
