import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260910000000_create_sanitized_submissions.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Try common Supabase pooler / direct connection strings
const hosts = [
  'db.igivdidxxfsyjivjlhhc.supabase.co',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com'
];

async function tryConnect() {
  for (const host of hosts) {
    console.log(`Trying host ${host}...`);
    const client = new Client({
      host,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'placeholder_password',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
      console.log(`Connected to ${host}! Executing migration...`);
      await client.query(sqlContent);
      console.log('Migration executed successfully via direct Postgres connection!');
      await client.end();
      return;
    } catch (err: any) {
      console.log(`Host ${host} failed: ${err.message}`);
    }
  }
}

tryConnect();
