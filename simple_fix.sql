UPDATE users SET subscription_start_date = '2024-12-27' WHERE role != 'ADMIN';
UPDATE users SET subscription_end_date = '2025-12-27' WHERE role != 'ADMIN';
UPDATE users SET subscription_start_date = '2024-12-27' WHERE role = 'ADMIN';
UPDATE users SET subscription_end_date = '2124-12-27' WHERE role = 'ADMIN';
