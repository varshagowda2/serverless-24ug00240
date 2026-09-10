import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const secretKey = process.env.SUPABASE_SECRET_KEY || '';

console.log('Testing Supabase Connection:');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, secretKey);

async function testDB() {
  const { data, error } = await supabase.from('sanitized_submissions').select('*');
  console.log('Select Result:', { data, error });
}

testDB();
