# Webhook Secret Setup

Om de webhook functionaliteit te activeren, moet je de WEBHOOK_URL secret instellen in Supabase.

## Stap 1: Verkrijg je Webhook URL

Je hebt een webhook URL nodig waar de configurator data naartoe wordt verzonden. Dit kan bijvoorbeeld zijn:
- Een Zapier webhook URL
- Een Make.com webhook URL  
- Een eigen API endpoint
- Een andere webhook service

## Stap 2: Stel de Secret in

Voer het volgende commando uit met jouw webhook URL:

```bash
npx supabase secrets set WEBHOOK_URL=jouw_webhook_url_hier
```

**Voorbeeld:**
```bash
npx supabase secrets set WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/123456/abcdef
```

## Wat wordt verzonden?

De edge function stuurt de volgende data naar de webhook:

```json
{
  "submission_id": "uuid",
  "created_at": "2026-01-02T...",
  "name": "Naam van klant",
  "email": "email@example.com",
  "address": "Straat 123, 1234 AB Plaats (optioneel)",
  "service_details": {
    "value": "keukens",
    "label": "Keukens",
    "description": "Kastdeuren, fronten en panelen"
  },
  "color_details": {
    "id": "color-id",
    "name": "Kleur naam",
    "code": "S115",
    "image_url": "https://..."
  },
  "image_url": "https://utsednlmdhdlmcterjoa.supabase.co/storage/v1/object/public/configurator-uploads/uploads/..."
}
```

## Verificatie

Na het instellen van de secret, test de configurator door een formulier in te vullen. De data wordt automatisch:
1. Opgeslagen in de Supabase database (tabel: submissions)
2. Verzonden naar jouw webhook URL

