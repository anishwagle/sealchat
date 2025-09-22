CREATE TABLE IF NOT EXISTS seal_chat.notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('friend_request_sent','friend_request_accept', 'mention', 'like', 'comment','profile_like','tipped','subscribed') NOT NULL,
  source_user_id VARCHAR(255) NOT NULL,
  post_id VARCHAR(255) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (source_user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);