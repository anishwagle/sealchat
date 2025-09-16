CREATE TABLE IF NOT EXISTS seal_chat.friend_requests(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES seal_chat.users(id) ON DELETE CASCADE,
    Foreign Key (receiver_id) REFERENCES seal_chat.users(id) ON DELETE CASCADE,
    UNIQUE(sender_id,receiver_id),
    CHECK(sender_id != receiver_id)
);