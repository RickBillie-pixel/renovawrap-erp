create table if not exists public.admin_configurations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text not null,
  service_details jsonb,
  color_details jsonb,
  result_url text,
  status text default 'pending'
);

-- Enable RLS
alter table public.admin_configurations enable row level security;

-- Policies
create policy "Enable read access for authenticated users"
  on public.admin_configurations for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on public.admin_configurations for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on public.admin_configurations for update
  to authenticated
  using (true);

-- Allow service role full access
create policy "Enable all access for service role"
  on public.admin_configurations for all
  to service_role
  using (true);

