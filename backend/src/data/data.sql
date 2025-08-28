CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Role can be 'user' or 'admin'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews(
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
        UNIQUE (user_id, game_id), -- Ensure a user can only review a game once
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)

CREATE TABLE IF NOT EXISTS games(
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
)