-- Seed Data for auth_db
-- Admin and test users with correct password hashes

-- Admin user (email: admin@inventaris.com, password: admin123)
INSERT INTO users (email, password_hash, role, name, organization, is_active)
VALUES (
  'admin@inventaris.com',
  '$2a$10$GxJ/H8EkdcBMd7ZcHUdJ/utm4IA5x5tBwAXOyzE2cq0Wm0AdbKz9S',
  'admin',
  'System Administrator',
  'IT Department',
  true
) ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  organization = EXCLUDED.organization,
  is_active = EXCLUDED.is_active;

-- Test users (password: user123)
INSERT INTO users (email, password_hash, role, name, nim, phone, organization, is_active)
VALUES 
  ('user1@example.com', '$2a$10$GxJ/H8EkdcBMd7ZcHUdJ/utm4IA5x5tBwAXOyzE2cq0Wm0AdbKz9S', 'user', 'Test User 1', '2021001', '08123456789', 'Computer Science', true),
  ('user2@example.com', '$2a$10$GxJ/H8EkdcBMd7ZcHUdJ/utm4IA5x5tBwAXOyzE2cq0Wm0AdbKz9S', 'user', 'Test User 2', '2021002', '08123456790', 'Information Systems', true),
  ('user3@example.com', '$2a$10$GxJ/H8EkdcBMd7ZcHUdJ/utm4IA5x5tBwAXOyzE2cq0Wm0AdbKz9S', 'user', 'Test User 3', '2021003', '08123456791', 'Engineering', true)
ON CONFLICT (email) DO NOTHING;
