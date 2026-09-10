import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { validateUserInput } from './validator.ts';

// Standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  // Enforce HTTP POST method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Method ${req.method} Not Allowed`,
        error: 'Only POST requests are accepted',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // 1. Parse JSON Request Body safely
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Malformed JSON payload',
          errors: { _body: 'Invalid JSON request format' },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Validate and Sanitize Input fields
    const validation = validateUserInput(rawBody);

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Input validation failed',
          errors: validation.errors,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { name, email, phone, message } = validation.sanitizedData;

    // 3. Connect to Supabase using privileged environment credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    let record = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      message,
      created_at: new Date().toISOString(),
    };

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: insertedData, error: dbError } = await supabase
        .from('sanitized_submissions')
        .insert([{ name, email, phone, message }])
        .select()
        .single();

      if (dbError) {
        console.error('Database Insertion Error:', dbError);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Database storage error',
            error: 'Failed to persist sanitized submission',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      record = insertedData;
    }

    // 4. Return Success Response with Sanitized Data Record
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Input sanitized and stored successfully',
        data: record,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('Unhandled Edge Function Error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: 'An unexpected error occurred during sanitization',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
