/*
  # Remove RLS Restrictions
  
  1. Changes:
    - Update RLS policies to allow public access for all operations
    - Enable unrestricted access to admins and articles tables
    
  2. Security Note:
    - This removes all access restrictions
    - Anyone can read, create, update, and delete records
*/

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all rows in the admins table
CREATE POLICY "Public can read admins"
ON admins
FOR SELECT
USING (true);

-- Allow anyone to insert into the admins table
CREATE POLICY "Public can insert into admins"
ON admins
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update all rows in the admins table
CREATE POLICY "Public can update admins"
ON admins
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete all rows in the admins table
CREATE POLICY "Public can delete admins"
ON admins
FOR DELETE
USING (true);

-- Enable RLS on articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all rows in the articles table
CREATE POLICY "Public can read articles"
ON articles
FOR SELECT
USING (true);

-- Allow anyone to insert into the articles table
CREATE POLICY "Public can insert into articles"
ON articles
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update all rows in the articles table
CREATE POLICY "Public can update articles"
ON articles
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete all rows in the articles table
CREATE POLICY "Public can delete articles"
ON articles
FOR DELETE
USING (true);