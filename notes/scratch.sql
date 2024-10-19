-- User entity
CREATE TABLE user (
  -- ?user_id SERIAL PRIMARY KEY,
  -- auth0_id,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- password (encrypted),
);

-- Room entity, used for channels, dms, etc
CREATE TABLE room (
  room_id SERIAL PRIMARY KEY,
  room_name VARCHAR(255) UNIQUE NOT NULL,
  is_private BOOLEAN DEFAULT FALSE, -- not searchable, must be invited
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationship between a user and a room (1 to 1)
CREATE TABLE membership (
  membership_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  room_id INT REFERENCES rooms(room_id),
  role VARCHAR(50),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);