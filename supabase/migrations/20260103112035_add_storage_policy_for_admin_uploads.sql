-- Allow authenticated users to upload to configurator-uploads bucket
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'configurator-uploads' );

-- Allow authenticated users to read files in configurator-uploads bucket (if not already public)
create policy "Allow authenticated users to read files"
on storage.objects for select
to authenticated
using ( bucket_id = 'configurator-uploads' );

-- Allow authenticated users to update files in configurator-uploads bucket
create policy "Allow authenticated users to update files"
on storage.objects for update
to authenticated
using ( bucket_id = 'configurator-uploads' );

-- Allow authenticated users to delete files in configurator-uploads bucket
create policy "Allow authenticated users to delete files"
on storage.objects for delete
to authenticated
using ( bucket_id = 'configurator-uploads' );

