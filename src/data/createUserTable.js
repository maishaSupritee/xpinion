import pool from "../config/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const createUserTable = async () => {
  const queryText = `CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT NOW()
);`;

  try {
    await pool.query(queryText);
    console.log(
      "User table created successfully, if it does not already exist."
    );

    await createDefaultAdmin();
  } catch (error) {
    console.error("Error creating user table: ", error);
  }
};

const createDefaultAdmin = async () => {
  try {
    // if admin already exists, skip creation
    const adminCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1;",
      [process.env.ADMIN_EMAIL]
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
      );

      const result = await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role",
        [
          process.env.ADMIN_USERNAME,
          process.env.ADMIN_EMAIL,
          hashedPassword,
          "admin",
        ]
      );

      console.log("Default admin user created:", result.rows[0]);
    } else {
      console.log("Default admin already exists, skipping creation.");
    }
  } catch (error) {
    console.error("Error creating default admin: ", error);
  }
};

export default createUserTable;
