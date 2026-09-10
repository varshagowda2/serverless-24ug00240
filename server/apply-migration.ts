import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const secretKey = process.env.SUPABASE_SECRET_KEY || '';

console.log('Connecting to Supabase Project:', supabaseUrl);

const supabase = createClient(supabaseUrl, secretKey);

async function runMigration() {
  console.log('Migration SQL check via Supabase REST...');

  // First check if table already exists by querying postgrest schema
  const { data, error } = await supabase.from('sanitized_submissions').select('*').limit(1);

  if (!error) {
    console.log('Table sanitized_submissions already exists on Supabase PostgreSQL!');
    console.log('Existing Records:', data);
    return;
  }

  console.log('Table query result:', error.message);
}

runMigration();
