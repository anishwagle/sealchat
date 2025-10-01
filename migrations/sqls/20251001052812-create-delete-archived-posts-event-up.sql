CREATE EVENT IF NOT EXISTS delete_archived_posts
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM posts
  WHERE is_archived = TRUE
    AND expires_at <= NOW();