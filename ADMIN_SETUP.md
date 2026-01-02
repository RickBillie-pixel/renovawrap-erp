# Admin Dashboard Setup Guide

## Overzicht

Het admin dashboard is nu volledig geïmplementeerd met:
- Unified Leads systeem (Configurator + Contact Formulier)
- Authenticatie via Supabase Auth
- CRM functionaliteit (status management, notities)
- Email notificaties voor nieuwe leads

## Database Migraties

Voer de volgende migraties uit via Supabase CLI of de Supabase dashboard:

```bash
# Migraties toepassen
npx supabase migration up
```

Of via de Supabase dashboard:
1. Ga naar Database > Migrations
2. Upload en voer de migraties uit in volgorde:
   - `20240101000002_create_contact_requests_table.sql`
   - `20240101000003_add_crm_columns_to_submissions.sql`
   - `20240101000004_create_contact_uploads_bucket.sql`

## Email Notificaties Configureren

### Gmail SMTP (Gratis)

1. Maak een Gmail account aan of gebruik een bestaande
2. Genereer een App Password:
   - Ga naar Google Account > Security
   - Schakel 2-Step Verification in (indien nog niet gedaan)
   - Ga naar "App passwords" en genereer een nieuw wachtwoord voor "Mail"
3. Voeg de SMTP secrets toe aan Supabase:

```bash
npx supabase secrets set SMTP_HOST=smtp.gmail.com
npx supabase secrets set SMTP_PORT=587
npx supabase secrets set SMTP_USER=jouw-email@gmail.com
npx supabase secrets set SMTP_PASS=jouw-app-password
npx supabase secrets set SMTP_FROM=jouw-email@gmail.com
npx supabase secrets set NOTIFICATION_EMAIL=admin@foxwrap.nl
```

### Andere SMTP Providers

Je kunt ook andere gratis SMTP providers gebruiken:
- **Outlook/Hotmail**: smtp-mail.outlook.com, poort 587
- **Yahoo**: smtp.mail.yahoo.com, poort 587
- **Zoho**: smtp.zoho.com, poort 587

Pas de `SMTP_HOST` en `SMTP_PORT` aan in de secrets.

## Admin Account Aanmaken

1. Ga naar Supabase Dashboard > Authentication > Users
2. Klik op "Add user" > "Create new user"
3. Voer email en wachtwoord in
4. Log in via `/admin/login` met deze credentials

## Edge Functions Deployen

Deploy de nieuwe `notify-admin` function:

```bash
npx supabase functions deploy notify-admin
```

Zorg ervoor dat de secrets zijn ingesteld voordat je de function deployed.

## Features

### Admin Dashboard (`/admin`)

- **Unified Leads View**: Alle leads van zowel Configurator als Contact Formulier in één overzicht
- **Filtering**: Filter op bron (Configurator/Contact) en status (Nieuw/In Behandeling/Afgerond/Gearchiveerd)
- **Status Management**: Update de status van leads direct vanuit de tabel
- **Detail View**: Klik op "Details" om volledige informatie te zien:
  - Configurator leads: Toont service details, kleur keuze, en upload afbeelding
  - Contact leads: Toont project type, bericht, en geüploade foto's
- **Admin Notities**: Voeg interne notities toe aan elke lead
- **Real-time Stats**: Overzicht van totaal aantal leads, nieuwe leads, etc.

### Email Notificaties

Wanneer een nieuwe lead binnenkomt (via Configurator of Contact Formulier), wordt automatisch een email gestuurd naar het adres ingesteld in `NOTIFICATION_EMAIL`.

De email bevat:
- Lead ID
- Naam en contactgegevens
- Datum/tijd
- Volledige details (afhankelijk van bron)

## Security

- Admin routes zijn beschermd met `AuthGuard` component
- Alleen geauthenticeerde gebruikers kunnen het dashboard bekijken
- RLS policies zorgen ervoor dat alleen admins data kunnen lezen/updaten
- Contact formulier uploads zijn publiek leesbaar (voor weergave), maar alleen admins kunnen alle data zien

## Troubleshooting

### Email notificaties werken niet

1. Controleer of `NOTIFICATION_EMAIL` secret is ingesteld
2. Controleer of `RESEND_API_KEY` is ingesteld (als je Resend gebruikt)
3. Check de Edge Function logs in Supabase Dashboard
4. Zorg ervoor dat je Resend domain is geverifieerd

### Kan niet inloggen

1. Controleer of het admin account bestaat in Supabase Auth
2. Controleer of de email correct is
3. Reset het wachtwoord indien nodig via Supabase Dashboard

### Leads worden niet getoond

1. Controleer of de migraties zijn uitgevoerd
2. Controleer RLS policies in Supabase Dashboard
3. Controleer of je ingelogd bent als admin

