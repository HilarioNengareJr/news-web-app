/*
  # Add Dummy Admin User
  
  1. Changes:
    - Insert a dummy admin user for testing
    - Email: admin@example.com
    - Password: admin123
*/

-- Insert dummy admin user into auth.users
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  role
)
VALUES (
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profile
INSERT INTO public.profiles (
  id,
  email,
  role
)
SELECT 
  id,
  email,
  'admin'
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING;