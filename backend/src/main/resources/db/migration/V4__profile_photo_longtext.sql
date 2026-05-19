-- Widen profile_photo_url so it can hold base64 data URIs when MinIO is unavailable
ALTER TABLE users MODIFY COLUMN profile_photo_url LONGTEXT;
