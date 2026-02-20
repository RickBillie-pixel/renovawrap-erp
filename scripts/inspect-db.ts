import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log('Inspecting "projects" table...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
  } else {
    console.log('Projects table access successful. Sample data:', projects);
  }

  console.log('\nInspecting "contact-uploads" bucket...');
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .getBucket('contact-uploads');

  if (bucketsError) {
    console.error('Error fetching bucket:', bucketsError);
  } else {
    console.log('Bucket "contact-uploads" exists:', buckets);
  }
  
  // Try to insert a dummy project to check permissions
  console.log('\nTesting insert permission...');
  const dummyProject = {
      name: "Test Project " + Date.now(),
      category: "Test",
      before_image_url: "https://example.com/before.jpg",
      after_image_url: "https://example.com/after.jpg"
  };
  
  const { data: insertData, error: insertError } = await supabase
      .from('projects')
      .insert(dummyProject)
      .select();
      
  if (insertError) {
      console.error('Insert failed:', insertError);
  } else {
      console.log('Insert successful:', insertData);
      // Clean up
      const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', insertData[0].id);
          
      if (deleteError) {
          console.error('Cleanup failed:', deleteError);
      } else {
          console.log('Cleanup successful');
      }
  }

}

inspect();
