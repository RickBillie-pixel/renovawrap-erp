# Supabase Deployment Instructions

## Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Logged in to Supabase: `npx supabase login`
3. Your Supabase project reference ID

## Deployment Steps

### 1. Link Your Project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF_ID
```

### 2. Deploy Database Migrations
```bash
npx supabase db push
```
This will create the `submissions` table and storage bucket.

### 3. Deploy Edge Function
```bash
npx supabase functions deploy submit-configuration
```

### 4. Set Webhook URL Secret
```bash
npx supabase secrets set WEBHOOK_URL=your_webhook_url_here
```

### 5. Environment Variables
Create a `.env` file in the project root with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings: https://app.supabase.com/project/_/settings/api

## Verification

After deployment, verify:
1. Database table exists: Check Supabase Dashboard > Database > Tables
2. Storage bucket exists: Check Supabase Dashboard > Storage > Buckets
3. Edge function is deployed: Check Supabase Dashboard > Edge Functions
4. Secret is set: Check Supabase Dashboard > Project Settings > Edge Functions > Secrets

