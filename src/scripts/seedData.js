import pool from "../config/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/** --- SEED DATA --- **/
const users = [
  { username: "link", email: "link@hyrule.com", password: "Password123!" },
  { username: "zelda", email: "zelda@hyrule.com", password: "Password123!" },
  { username: "elden", email: "tarnished@lands.com", password: "Password123!" },
];

const games = [
  {
    title: "The Legend of Zelda: Breath of the Wild",
    genre: "Action-Adventure",
    description: "Open-world adventure in Hyrule.",
    developer: "Nintendo EPD",
    release_date: "2017-03-03",
    publisher: "Nintendo",
    platform: "Nintendo Switch",
    image_url:
      "https://upload.wikimedia.org/wikipedia/en/a/a2/Breath_of_the_Wild.jpg",
  },
  {
    title: "Elden Ring",
    genre: "Action RPG",
    description: "Dark fantasy open-world action RPG.",
    developer: "FromSoftware",
    release_date: "2022-02-25",
    publisher: "Bandai Namco Entertainment",
    platform: "PC, PS4, PS5, Xbox One, Xbox Series X/S",
    image_url:
      "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
  },
  {
    title: "Super Mario Odyssey",
    genre: "Platformer",
    description: "Mario globe-trotting with Cappy.",
    developer: "Nintendo EPD",
    release_date: "2017-10-27",
    publisher: "Nintendo",
    platform: "Nintendo Switch",
    image_url:
      "https://upload.wikimedia.org/wikipedia/en/8/8d/Super_Mario_Odyssey.jpg",
  },
];

// Using keys so we can reference them when creating reviews
// user: by email, game: by `${title}::${platform}`
const reviews = [
  {
    title: "Masterpiece",
    content: "Exploration is S-tier.",
    rating: 5,
    userEmail: "link@hyrule.com",
    gameKey: "The Legend of Zelda: Breath of the Wild::Nintendo Switch",
  },
  {
    title: "Hard but fair",
    content: "Boss fights are incredible.",
    rating: 5,
    userEmail: "tarnished@lands.com",
    gameKey: "Elden Ring::PC, PS4, PS5, Xbox One, Xbox Series X/S",
  },
  {
    title: "Joyful",
    content: "Movement is buttery smooth.",
    rating: 4,
    userEmail: "zelda@hyrule.com",
    gameKey: "Super Mario Odyssey::Nintendo Switch",
  },
];

async function upsertUsers(client) {
  const map = new Map(); // email -> id; key = email, value = user id
  // Use ON CONFLICT to update username if email already exists
  const sql = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
    RETURNING id, email;
  `;
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, SALT_ROUNDS);
    const { rows } = await client.query(sql, [u.username, u.email, hashed]);
    map.set(rows[0].email, rows[0].id); // Store email -> id mapping
  }
  return map;
}

async function upsertGames(client) {
  const map = new Map(); // `${title}::${platform}` -> id
  // Use ON CONFLICT to update game details if title and platform already exist
  // This assumes title and platform together are unique
  // EXCLUDED refers to the new values being inserted
  const sql = `
    INSERT INTO games (title, description, genre, developer, release_date, publisher, platform, image_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (title, platform) DO UPDATE SET
      description = EXCLUDED.description,
      genre = EXCLUDED.genre,
      developer = EXCLUDED.developer,
      release_date = EXCLUDED.release_date,
      publisher = EXCLUDED.publisher,
      image_url = EXCLUDED.image_url
    RETURNING id, title, platform;
  `;
  for (const g of games) {
    const { rows } = await client.query(sql, [
      g.title,
      g.description,
      g.genre,
      g.developer,
      g.release_date,
      g.publisher,
      g.platform,
      g.image_url,
    ]);
    const key = `${rows[0].title}::${rows[0].platform}`;
    map.set(key, rows[0].id);
  }
  return map;
}

async function insertReviews(client, userMap, gameMap) {
  // Use ON CONFLICT to skip duplicates
  // This assumes title is unique per user and game combination
  const sql = `
    INSERT INTO reviews (title, content, rating, user_id, game_id)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT DO NOTHING
    RETURNING id, title;
  `;
  for (const r of reviews) {
    const userId = userMap.get(r.userEmail);
    const gameId = gameMap.get(r.gameKey);
    if (!userId || !gameId) {
      console.warn(
        `Skipping review "${r.title}" — missing user or game (userId=${userId}, gameId=${gameId})`
      );
      continue;
    }
    const { rows } = await client.query(sql, [
      r.title,
      r.content,
      r.rating,
      userId,
      gameId,
    ]);
    if (rows[0]) {
      console.log(`✅ Review: ${rows[0].id} — ${rows[0].title}`);
    } else {
      console.log(`ℹ️ Review already exists or was skipped: ${r.title}`);
    }
  }
}

// Ensure unique indexes for users and games
// This is a one-time setup to ensure data integrity
// and should be run before inserting any data
async function ensureUniqueIndexes(client) {
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
      ON users (email);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_games_title_platform
      ON games (title, platform);
  `);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start transaction
    await ensureUniqueIndexes(client);
    console.log("Seeding users...");
    const userMap = await upsertUsers(client);

    console.log("Seeding games...");
    const gameMap = await upsertGames(client);

    console.log("Seeding reviews...");
    await insertReviews(client, userMap, gameMap);

    await client.query("COMMIT"); // Commit transaction
    console.log("✅ Seed complete");
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("❌ Seed failed:", err.stack || err);
  } finally {
    client.release(); // Release the client back to the pool
    // Close the pool to terminate the connection after seeding
    await pool.end();
  }
}

main();
