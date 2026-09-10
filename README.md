# Data Sanitization & Validation System

A production-quality security demonstration application built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Supabase Edge Functions**, and **Supabase PostgreSQL (Row Level Security)**.

The core objective of this system is to demonstrate defense-in-depth data sanitization and validation. The client browser is **never** permitted to directly insert user input into PostgreSQL; instead, all submissions must pass through a server-side Supabase Edge Function that sanitizes, validates, and stores clean data.

---

## 🏛️ System Architecture

```
User Form / Security Test Payloads
                ↓
    (Frontend Basic Validation)
                ↓
  POST to Supabase Edge Function (/functions/v1/sanitize-input)
                ↓
  Server-Side Sanitization (sanitizeInput & field routines)
                ↓
  Server-Side Validation (validateUserInput)
                ↓
  Supabase PostgreSQL (sanitized_submissions table with RLS)
                ↓
  Return Sanitized Data Record to Frontend Dashboard
```

### 💡 Why Sanitization MUST Happen Server-Side

1. **Client Bypass Risk**: Client-side validation in JavaScript running in the user's browser can be trivially bypassed using HTTP clients (Curl, Postman), browser DevTools, or custom scripts.
2. **Database Integrity**: Relying solely on frontend validation exposes backend databases to malformed data, malicious XSS payloads, and control characters.
3. **Defense-in-Depth**: While frontend validation improves user experience by providing instant feedback, **only server-side sanitization and validation** can guarantee data integrity before database mutation.

---

## 🛠️ Technologies Used

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Edge**: Supabase Edge Functions (Deno / TypeScript), Express (Local API Proxy runner)
- **Database**: Supabase PostgreSQL, Row Level Security (RLS) policies, SQL migrations
- **Testing**: Vitest unit testing suite (35 automated tests)

---

## 📁 Folder Structure

```
data-sanitization-system/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Application title, subtitle & security badges
│   │   ├── InputForm.tsx           # User entry form with validation error & loading state
│   │   ├── SanitizationPreview.tsx # Live side-by-side plain-text comparison (Original vs Sanitized)
│   │   ├── SecurityTestCases.tsx   # 7 interactive security attack vector test presets
│   │   ├── DashboardStats.tsx      # Submission counts & system defense metrics
│   │   └── SubmissionTable.tsx     # Escaped PostgreSQL database records table
│   ├── lib/
│   │   ├── sanitizer.ts            # Server/Client reusable sanitization module
│   │   ├── validation.ts           # Field-specific validation module
│   │   └── supabase.ts             # Supabase client helper
│   ├── pages/
│   │   └── Home.tsx                # Main dashboard page layout
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Glassmorphism utilities & Tailwind directives
├── supabase/
│   ├── functions/
│   │   └── sanitize-input/
│   │       ├── index.ts            # Deno Edge Function handler (CORS, JSON parsing, DB insert)
│   │       ├── sanitizer.ts        # Edge Function Deno sanitizer
│   │       └── validator.ts        # Edge Function Deno validator
│   └── migrations/
│       └── 20260910000000_create_sanitized_submissions.sql # Database schema & RLS policies
├── server/
│   └── local-api.ts                # Local Express API runner mirroring Edge Function
├── tests/
│   ├── sanitizer.test.ts           # 27 unit tests for sanitization logic
│   └── validator.test.ts           # 8 unit tests for validation logic
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔒 Security & Defense-in-Depth Implementation

1. **Strict XSS Neutralization**: Removes `<script>` and `<style>` blocks with their contents, strips HTML tags (`<...>` replaced with space), and neutralizes event handlers (`onerror=`, `onload=`) and `javascript:` pseudo-protocols.
2. **Escape Plain Text Rendering**: User-provided inputs are displayed strictly as plain text (zero `dangerouslySetInnerHTML` usage) to prevent DOM-based XSS when viewing stored entries.
3. **Parameterized SQL Database Operations**: PostgreSQL operations use parameterized queries via Supabase client to prevent SQL Injection.
4. **Row Level Security (RLS)**: Anonymous client keys (`anon`) are granted `SELECT` permission for dashboard viewing, but `INSERT` is restricted exclusively to `service_role` (Edge Function execution). Direct client writes are rejected by PostgreSQL.
5. **Control Character Stripping**: Removes non-printable ASCII control characters (`\x00-\x08`, `\x0B-\x0C`, `\x0E-\x1F`, `\x7F`).
6. **Field-Specific Length & Structural Enforcement**:
   - **Name**: Max 100 chars, letters, spaces, hyphens, apostrophes.
   - **Email**: Max 254 chars, RFC 5322 regex validation, lowercase conversion.
   - **Phone**: Max 30 chars, digits, leading `+`, hyphens, spaces, parentheses.
   - **Message**: Max 2000 chars, HTML stripped, normal text preserved.

---

## 🗄️ Database Schema & RLS Setup

The migration file is located at `supabase/migrations/20260910000000_create_sanitized_submissions.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.sanitized_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sanitized_submissions_email ON public.sanitized_submissions (email);
CREATE INDEX IF NOT EXISTS idx_sanitized_submissions_created_at ON public.sanitized_submissions (created_at DESC);

-- Enable RLS
ALTER TABLE public.sanitized_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public read access for dashboard display
CREATE POLICY "Allow public read access for dashboard"
    ON public.sanitized_submissions FOR SELECT
    TO anon, authenticated USING (true);

-- Restrict INSERT to service role only (Edge Function)
CREATE POLICY "Allow service role insert only"
    ON public.sanitized_submissions FOR INSERT
    TO service_role WITH CHECK (true);
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Installation
```bash
npm install
```

### 4. Running the Local API Proxy & Development Server

**Step 1: Start the Local API Server (Mirrors Supabase Edge Function)**
```bash
npm run server
```
*Runs on `http://localhost:3001`.*

**Step 2: Start the Vite Frontend Server (In a separate terminal)**
```bash
npm run dev
```
*Runs on `http://localhost:5173`.*

---

## 🧪 Running Automated Unit Tests

Execute the 35 Vitest unit tests:
```bash
npm test
```

Expected output:
```
 ✓ tests/validator.test.ts (8 tests)
 ✓ tests/sanitizer.test.ts (27 tests)

 Test Files  2 passed (2)
      Tests  35 passed (35)
```

---

## ⚡ Supabase Edge Function Deployment

To deploy the Edge Function to your live Supabase project:

1. Install Supabase CLI and login:
   ```bash
   npx supabase login
   ```
2. Link your project:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```
3. Push database migrations:
   ```bash
   npx supabase db push
   ```
4. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy sanitize-input --no-verify-jwt
   ```
5. Update your `.env` with your deployed function URL:
   ```env
   VITE_SUPABASE_FUNCTION_URL=https://<your-project-ref>.supabase.co/functions/v1/sanitize-input
   ```

---

## 🧪 Example Malicious Inputs vs. Sanitized Outputs

### Example 1: Script Tag Payload (XSS Attack)
- **Request Body**:
  ```json
  {
    "name": "<script>alert('x')</script> Gagan!!!",
    "email": " GAGAN@EXAMPLE.COM ",
    "phone": "+91 98765-43210",
    "message": "<h1>Hello</h1><script>alert('XSS')</script>"
  }
  ```
- **Sanitized PostgreSQL Record**:
  ```json
  {
    "id": "a9b1c2d3-4567-890a-bcde-f123456789ab",
    "name": "Gagan",
    "email": "gagan@example.com",
    "phone": "+91 98765-43210",
    "message": "Hello"
  }
  ```

### Example 2: Event Handler Payload (`onerror=`)
- **Raw Input**: `<img src=x onerror=alert(1)> Welcome user`
- **Sanitized Output**: `Welcome user`

### Example 3: JavaScript URL Pseudo-Protocol
- **Raw Input**: `javascript:alert("XSS")`
- **Sanitized Output**: `alert("XSS")`

---

## 📜 License
MIT License. Built for security demonstration and production reference.
