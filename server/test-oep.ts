import { createClient } from '@supabase/supabase-js';

const url = 'https://oepvihbriktffqksilcx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcHZpaGJyaWt0ZmZxa3NpbGN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTAxMDExMiwiZXhwIjoyMTA0NTg2MTEyfQ.dchqC2rlQT4MwobyC7cyqH5Rwab3zCPQzX3UZlQOdj8';

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('sanitized_submissions').select('*');
  console.log('OEP Result:', { data, error });
}

check();
