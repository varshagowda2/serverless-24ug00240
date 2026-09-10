import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://igivdidxxfsyjivjlhhc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateRecord() {
  console.log('Updating database record in Supabase PostgreSQL...');

  // Update existing records where name is Gagan
  const { data: updatedData, error: updateErr } = await supabase
    .from('sanitized_submissions')
    .update({
      name: 'Varshini M',
      email: 'varshini@example.com'
    })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  if (updateErr) {
    console.error('Failed to update PostgreSQL record:', updateErr);
  } else {
    console.log('PostgreSQL records updated successfully:', updatedData);
  }

  // Insert fresh record with Varshini M if table was empty
  if (!updatedData || updatedData.length === 0) {
    console.log('No existing rows found to update. Inserting new Varshini M record...');
    const { data: inserted, error: insertErr } = await supabase
      .from('sanitized_submissions')
      .insert([{
        name: 'Varshini M',
        email: 'varshini@example.com',
        phone: '+91 98765-43210',
        message: 'Hello Test'
      }])
      .select();

    if (insertErr) {
      console.error('Failed to insert record:', insertErr);
    } else {
      console.log('Inserted fresh record:', inserted);
    }
  }
}

updateRecord();
