// This file is used to configure the database connection using the pg module.
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
const { Pool } = pkg; //pg is a common js module and doesnt allow us to directly import Pool from it

console.log(
  process.env.DB_USER,
  process.env.DB_HOST,
  process.env.DB_NAME,
  process.env.DB_PORT,
  process.env.DB_PASSWORD
); //log the environment variables to check if they are being read correctly

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
}); //pool of connection which will be used to connect to the database everytime

pool.on("connect", () => {
  console.log("Connected to the database");
}); //callback function to log when the connection is established with the database

export default pool;
