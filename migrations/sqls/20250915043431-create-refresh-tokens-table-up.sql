CREATE TABLE IF NOT EXISTS seal_chat.refresh_tokens(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES seal_chat.users(id) ON DELETE CASCADE,
    UNIQUE(token),
    INDEX idx_user_id(user_id)
);