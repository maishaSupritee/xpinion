// This file is used to configure the database connection using the pg module.
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
const { Pool } = pkg; //pg is a common js module and doesnt allow us to directly import Pool from it

const localUrl =
  process.env.DB_USER && process.env.DB_HOST && process.env.DB_NAME
    ? `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${
        process.env.DB_HOST
      }:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`
    : undefined;

// Prefer host-provided DATABASE_URL (Render), else fall back to local pieces.
const connectionString = process.env.DATABASE_URL || localUrl;

if (!connectionString) {
  console.warn(
    "[DB] No DATABASE_URL or local DB_* env vars found. Did you set env vars?"
  );
}

const isProd = process.env.NODE_ENV === "production";

// Choose one of the ssl configs below.
// Broad-compat (works everywhere, weaker verification):
const sslConfig = isProd ? { rejectUnauthorized: false } : false;

// Safer (try this first; if you get cert errors in prod, switch to the broad one):
// const sslConfig = isProd ? { require: true, rejectUnauthorized: true } : false;

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: parseInt(process.env.PG_POOL_MAX || "10", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
}); //pool of connection which will be used to connect to the database everytime

pool.on("connect", () => {
  console.log("Connected to the database");
}); //callback function to log when the connection is established with the database
pool.on("error", (err) => {
  console.error("Error connecting to database: ", err);
});

export default pool;
