CREATE TABLE IF NOT EXISTS seal_chat.follows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id VARCHAR(255) NOT NULL,
    followed_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES seal_chat.users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES seal_chat.users(id) ON DELETE CASCADE,
    UNIQUE (follower_id, followed_id),
    CHECK (follower_id != followed_id)
);