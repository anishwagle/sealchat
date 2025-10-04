CREATE TABLE IF NOT EXISTS seal_chat.profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  location VARCHAR(255),
  location_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
  birthdate DATE, -- For age display or horoscopes
  birthdate_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
  gender ENUM('male', 'female', 'non-binary', 'other', 'prefer_not_to_say'), -- Inclusivity
  gender_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_at(created_at DESC),
  INDEX idx_user_id(user_id)
);