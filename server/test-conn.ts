import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing Supabase Connection:');
console.log('URL:', supabaseUrl);
console.log('Service Key:', serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'None');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testDB() {
  const { data, error } = await supabase.from('sanitized_submissions').select('*');
  console.log('Select Result:', { data, error });
}

testDB();
