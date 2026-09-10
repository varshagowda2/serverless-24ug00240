import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function runTests() {
  console.log('=== 1. Testing Privileged Insert via Service Role Key (Edge Function flow) ===');
  const testPayload = {
    name: 'Gagan',
    email: 'gagan@example.com',
    phone: '+91 98765-43210',
    message: 'Sanitized message text preserved.',
  };

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('sanitized_submissions')
    .insert([testPayload])
    .select()
    .single();

  if (insertErr) {
    console.error('Service Role Insert Failed:', insertErr);
  } else {
    console.log('Service Role Insert SUCCESS:', inserted);
  }

  console.log('\n=== 2. Testing Direct Client Insert Bypass via Anon Key (RLS Enforcement) ===');
  const { data: bypassData, error: bypassErr } = await supabaseAnon
    .from('sanitized_submissions')
    .insert([{
      name: '<script>alert("hack")</script>',
      email: 'hacker@evil.com',
      phone: '0000000000',
      message: 'Direct bypass attempt'
    }])
    .select();

  if (bypassErr) {
    console.log('Direct Client Insert BLOCKED BY RLS (EXPECTED BEHAVIOR):');
    console.log('Error Code:', bypassErr.code);
    console.log('Error Message:', bypassErr.message);
  } else {
    console.error('WARNING: Direct client insert succeeded! RLS is not blocking raw inserts:', bypassData);
  }

  console.log('\n=== 3. Testing Public Read Access via Anon Key ===');
  const { data: readData, error: readErr } = await supabaseAnon
    .from('sanitized_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (readErr) {
    console.error('Anon Read Failed:', readErr);
  } else {
    console.log('Anon Read SUCCESS. Total records visible:', readData?.length);
    console.log('Records:', readData);
  }
}

runTests();
