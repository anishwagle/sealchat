CREATE EVENT IF NOT EXISTS archive_expired_posts
ON SCHEDULE EVERY 1 DAY
DO
  UPDATE posts
  SET is_archived = TRUE,
      archived_at = NOW(),
      expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
  WHERE type = 'public_opinion'
    AND is_archived = FALSE
    AND expires_at <= NOW();