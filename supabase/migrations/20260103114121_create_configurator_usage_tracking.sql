-- Create a table to track configurator usage for cost calculation
-- This table is append-only and never gets deleted, so costs remain accurate even if configurations are deleted
create table if not exists public.configurator_usage_tracking (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  source text not null, -- 'public' or 'admin'
  configuration_id uuid, -- Reference to submissions or admin_configurations (can be null if deleted)
  cost_eur numeric(10, 2) default 0.15 not null
);

-- Create index for faster queries
create index if not exists idx_configurator_usage_created_at on public.configurator_usage_tracking(created_at desc);

-- Enable RLS
alter table public.configurator_usage_tracking enable row level security;

-- Only allow inserts (no updates or deletes) for authenticated users
create policy "Allow authenticated users to insert usage tracking"
  on public.configurator_usage_tracking for insert
  to authenticated
  with check (true);

-- Allow service role full access
create policy "Enable all access for service role"
  on public.configurator_usage_tracking for all
  to service_role
  using (true);

-- Allow authenticated users to read (for cost calculation)
create policy "Allow authenticated users to read usage tracking"
  on public.configurator_usage_tracking for select
  to authenticated
  using (true);

