-- Allow authenticated users to delete records from admin_configurations table
create policy "Allow authenticated users to delete admin configurations"
on public.admin_configurations for delete
to authenticated
using (true);

