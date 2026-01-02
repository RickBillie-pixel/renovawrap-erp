# Migraties Uitvoeren

De migraties kunnen niet automatisch worden uitgevoerd omdat de lokale Supabase niet draait.

## Optie 1: Via Supabase Dashboard (Aanbevolen)

1. Ga naar https://supabase.com/dashboard/project/utsednlmdhdlmcterjoa
2. Klik op **SQL Editor** in het menu
3. Kopieer en plak de inhoud van `supabase/migrations/apply_all_migrations.sql`
4. Klik op **Run** om de migraties uit te voeren

## Optie 2: Via Supabase CLI (als Docker draait)

Als je Docker Desktop hebt geïnstalleerd en draait:

```bash
npx supabase start
npx supabase db push
```

## Wat wordt uitgevoerd:

1. ✅ `contact_requests` tabel wordt aangemaakt
2. ✅ CRM kolommen worden toegevoegd aan `submissions` tabel
3. ✅ `contact-uploads` storage bucket wordt aangemaakt
4. ✅ RLS policies worden geconfigureerd

Na het uitvoeren van de migraties:
- Het contact formulier kan data opslaan
- Het admin dashboard kan alle leads tonen
- Foto uploads werken correct

