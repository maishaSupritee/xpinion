import pool from "../config/db.js";

const createReviewsTable = async () => {
  const queryText = `CREATE TABLE IF NOT EXISTS reviews(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating >=1 AND rating <=5),
    user_id INT,
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
            REFERENCES users(id)
                ON DELETE CASCADE,
    game_id INT,
    CONSTRAINT fk_game
        FOREIGN KEY (game_id)
            REFERENCES games(id)
                ON DELETE CASCADE,
    CONSTRAINT unique_review
        UNIQUE (user_id, game_id), 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)`;
  try {
    await pool.query(queryText);
    console.log(
      "Reviews table created successfully, if it does not already exist."
    );
  } catch (error) {
    console.error("Error creating reviews table: ", error);
  }
};

export default createReviewsTable;
