CREATE TABLE IF NOT EXISTS seal_chat.posts(
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type ENUM('friend_post','public_opinion') DEFAULT 'friend_post',
    content TEXT NOT NULL,
    original_content TEXT NOT NULL,
    duration_days INT CHECK (duration_days BETWEEN 1 AND 7 OR duration_days IS NULL),
    expires_at TIMESTAMP NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES seal_chat.users(id) ON DELETE CASCADE,
    INDEX idx_user_id(user_id),
    INDEX idx_expires_at(expires_at),
    INDEX idx_type(type)
)