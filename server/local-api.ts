import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateUserInput } from '../src/lib/validation';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory persistent fallback store for local development if Supabase credentials are not connected
const localDatabase: Array<{
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}> = [];

// Initialize Supabase Client if credentials exist
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';
const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseSecretKey && 
  !supabaseUrl.includes('example.supabase.co') &&
  !supabaseSecretKey.includes('placeholder')
);

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseSecretKey)
  : null;

/**
 * Local API endpoint mirroring the Supabase Edge Function:
 * POST /api/sanitize-input
 */
app.post('/api/sanitize-input', async (req, res) => {
  try {
    const rawBody = req.body;

    if (!rawBody || typeof rawBody !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Malformed JSON payload',
        errors: { _body: 'Invalid JSON request format' },
      });
    }

    // Run Server-side Sanitization and Validation
    const validation = validateUserInput(rawBody);

    if (!validation.valid) {
      return res.status(422).json({
        success: false,
        message: 'Input validation failed',
        errors: validation.errors,
      });
    }

    const { name, email, phone, message } = validation.sanitizedData;

    let storedRecord;

    if (supabase) {
      const { data, error } = await supabase
        .from('sanitized_submissions')
        .insert([{ name, email, phone, message }])
        .select()
        .single();

      if (error) {
        console.error('Supabase DB Insert Error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database storage error',
          error: error.message,
        });
      }
      storedRecord = data;
    } else {
      // Local fallback record creation
      storedRecord = {
        id: 'loc-' + Math.random().toString(36).substring(2, 11),
        name,
        email,
        phone,
        message,
        created_at: new Date().toISOString(),
      };
      localDatabase.unshift(storedRecord);
    }

    return res.status(200).json({
      success: true,
      message: 'Input sanitized and stored successfully',
      data: storedRecord,
    });
  } catch (err) {
    console.error('Local Server Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected server error occurred',
    });
  }
});

/**
 * GET /api/submissions
 * Returns recent submissions for dashboard visualization
 */
app.get('/api/submissions', async (_req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('sanitized_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, data: data || [] });
    }

    return res.json({ success: true, data: localDatabase });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// Handle 405 Method Not Allowed
app.all('/api/sanitize-input', (_req, res) => {
  res.status(405).json({
    success: false,
    message: 'Method Not Allowed',
    error: 'Only POST requests are accepted',
  });
});

app.listen(PORT, () => {
  console.log(`Local Edge Function Proxy running at http://localhost:${PORT}`);
  console.log(`- POST http://localhost:${PORT}/api/sanitize-input`);
  console.log(`- GET  http://localhost:${PORT}/api/submissions`);
});
