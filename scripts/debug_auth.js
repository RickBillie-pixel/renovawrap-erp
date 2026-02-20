import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://utsednlmdhdlmcterjoa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c2VkbmxtZGhkbG1jdGVyam9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzM5NDcsImV4cCI6MjA4Mjk0OTk0N30.MBvDoWGFY3FqaV2HdkdhkbzDOBgNNCZtxvVDtSIK0IY';

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
        // If getBucket fails (often does for anon), try listing buckets or just assume it exists if we can list files
        console.error('Error fetching bucket details (normal for anon):', bucketsError);

        console.log('Trying to list files in "contact-uploads"...');
        const { data: files, error: filesError } = await supabase
            .storage
            .from('contact-uploads')
            .list();

        if (filesError) {
            console.error('Error listing files:', filesError);
        } else {
            console.log('Bucket "contact-uploads" access successful. Files:', files ? files.length : 0);
        }
    } else {
        console.log('Bucket "contact-uploads" exists:', buckets);
    }
}

inspect();
