import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const buckets = ['avatars', 'post_images'];
  
  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (error) {
      console.error(`Error creating bucket ${bucket}:`, error.message);
    } else {
      console.log(`Bucket ${bucket} created successfully.`);
    }
  }
}

main();
