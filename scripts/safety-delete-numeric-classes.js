const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    const numericSlugs = ['6', '7', '8', '9', '10', '11', '12'];

    console.log('Starting cleanup of redundant numeric-slug classes...');

    for (const slug of numericSlugs) {
        // Double check MCQ count for this specific slug
        const { count } = await supabase.from('mcqs').select('*', { count: 'exact', head: true }).eq('course_type', slug);

        if (count === 0) {
            console.log(`Class with slug '${slug}' has 0 MCQs. Deleting...`);
            const { error } = await supabase.from('classes').delete().eq('slug', slug);
            if (error) {
                console.error(`Error deleting slug '${slug}':`, error);
            } else {
                console.log(`Successfully deleted slug '${slug}'.`);
            }
        } else {
            console.log(`WARNING: Slug '${slug}' actually has ${count} MCQs! Skipping deletion to be safe.`);
        }
    }

    console.log('\nCleanup finished.');
}

cleanup();
