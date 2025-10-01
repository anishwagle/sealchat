CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type ENUM('friend_post','public_opinion') DEFAULT 'friend_post',
    content TEXT NOT NULL,
    original_content TEXT NOT NULL,
    duration_days INT CHECK (duration_days BETWEEN 1 AND 7 OR duration_days IS NULL),
    expires_at TIMESTAMP NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shared_post_id VARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_user_id(user_id),
    INDEX idx_created_at(created_at DESC),
    INDEX idx_expires_at(expires_at),
    INDEX idx_type(type),
    INDEX idx_shared_post_id(shared_post_id),
    INDEX idx_is_archived(is_archived)
);



