CREATE TABLE IF NOT EXISTS seal_chat.comments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  post_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  original_content TEXT NOT NULL,
  parent_comment_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_created_at(created_at DESC),
  INDEX idx_user_id(user_id),
  INDEX idx_post_id(post_id),
  INDEX idx_parent_comment_id(parent_comment_id)
);