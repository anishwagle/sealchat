CREATE EVENT IF NOT EXISTS delete_archived_posts
ON SCHEDULE EVERY 30 MINUTE
DO
  DELETE FROM posts
  WHERE is_archived = TRUE
    AND expires_at <= NOW()
    LIMIT 6000;