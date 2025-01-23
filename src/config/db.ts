import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
async function testConnection() {
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .rpc('version')
      .single();
    
    if (error) throw error;
    console.log('Connected to Supabase successfully');
  } catch (error) {
    console.error('Supabase connection error:', error);
    process.exit(1);
  }
}

testConnection();

export { supabase };
