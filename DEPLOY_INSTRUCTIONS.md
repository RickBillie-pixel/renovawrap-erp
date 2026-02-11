# Deployment Instructies

## Database Migraties Uitvoeren

Voer de volgende migraties uit in volgorde via Supabase Dashboard of CLI:

### Via Supabase Dashboard:
1. Ga naar https://supabase.com/dashboard
2. Selecteer je project
3. Ga naar **SQL Editor**
4. Voer de migraties uit in deze volgorde:

#### 1. Contact Requests Table
```sql
-- Voer het bestand uit: supabase/migrations/20240101000002_create_contact_requests_table.sql
```

#### 2. CRM Columns to Submissions
```sql
-- Voer het bestand uit: supabase/migrations/20240101000003_add_crm_columns_to_submissions.sql
```

#### 3. Contact Uploads Bucket
```sql
-- Voer het bestand uit: supabase/migrations/20240101000004_create_contact_uploads_bucket.sql
```

#### 4. Allow Anonymous Select
```sql
-- Voer het bestand uit: supabase/migrations/20240101000005_allow_anon_select.sql
```

### Via Supabase CLI (als lokaal project):
```bash
npx supabase db push
```

## Edge Functions Deployen

De edge function is al gedeployed, maar als je updates wilt:

```bash
npx supabase functions deploy notify-admin
```

## SMTP Configuratie

Stel de SMTP secrets in:

```bash
npx supabase secrets set SMTP_HOST=smtp.gmail.com
npx supabase secrets set SMTP_PORT=587
npx supabase secrets set SMTP_USER=jouw-email@gmail.com
npx supabase secrets set SMTP_PASS=jouw-app-password
npx supabase secrets set SMTP_FROM=jouw-email@gmail.com
npx supabase secrets set NOTIFICATION_EMAIL=admin@renovawrap.nl
```

## Admin Account Aanmaken

1. Ga naar Supabase Dashboard > Authentication > Users
2. Klik op "Add user" > "Create new user"
3. Voer email en wachtwoord in
4. Log in via `/admin/login`

## Verificatie

Na het uitvoeren van de migraties:

1. **Test Contact Formulier:**
   - Ga naar `/contact`
   - Vul het formulier in en submit
   - Controleer of de data in `contact_requests` tabel staat

2. **Test Admin Dashboard:**
   - Log in via `/admin/login`
   - Controleer of beide lead types zichtbaar zijn:
     - Configurator leads (van `/configurator`)
     - Contact leads (van `/contact`)

3. **Test Email Notificaties:**
   - Submit een nieuwe lead via contact formulier
   - Controleer of email wordt ontvangen op `NOTIFICATION_EMAIL`

## Troubleshooting

### Contact formulier werkt niet:
- Controleer of `contact_requests` tabel bestaat
- Controleer RLS policies
- Controleer browser console voor errors

### Admin dashboard toont geen leads:
- Controleer of je ingelogd bent
- Controleer RLS policies voor authenticated users
- Controleer of de tabellen data bevatten

### Email notificaties werken niet:
- Controleer of SMTP secrets zijn ingesteld
- Controleer Gmail App Password
- Check Edge Function logs in Supabase Dashboard

