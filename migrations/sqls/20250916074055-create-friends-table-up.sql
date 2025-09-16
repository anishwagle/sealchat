CREATE TABLE IF NOT EXISTS seal_chat.friends(
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id_1 VARCHAR(255) NOT NULL,
user_id_2 VARCHAR(255) NOT NULL,
Foreign Key (user_id_1) REFERENCES seal_chat.users(id),
Foreign Key (user_id_2) REFERENCES seal_chat.users(id),
UNIQUE(user_id_1,user_id_2)
);