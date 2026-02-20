-- Ensure the projects table exists and has the correct schema
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  date date,
  before_image_url text,
  after_image_url text,
  category text,
  is_featured boolean default false,
  uitdaging text,
  oplossing text
);

-- Enable RLS
alter table projects enable row level security;

-- Policies for projects
create policy "Public projects are viewable by everyone"
  on projects for select
  using ( true );

create policy "Admins can do everything with projects"
  on projects for all
  using ( auth.role() = 'authenticated' );

-- Ensure storage bucket exists
insert into storage.buckets (id, name, public)
values ('contact-uploads', 'contact-uploads', true)
on conflict (id) do nothing;

-- Policies for storage
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'contact-uploads' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'contact-uploads' and auth.role() = 'authenticated' );

create policy "Authenticated users can update"
  on storage.objects for update
  using ( bucket_id = 'contact-uploads' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete"
  on storage.objects for delete
  using ( bucket_id = 'contact-uploads' and auth.role() = 'authenticated' );
