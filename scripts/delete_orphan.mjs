
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function deleteOrphan(slug) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase URL or Key");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Deleting all data associated with course_type: ${slug}...`);

    const tables = ['mcqs', 'short_questions', 'long_questions', 'subjects', 'chapters'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .delete({ count: 'exact' })
            .eq('course_type', slug);

        if (error) {
            console.error(`Error deleting from ${table}:`, error.message);
        } else {
            console.log(`Deleted ${count} records from ${table}.`);
        }
    }

    console.log(`Cleanup for ${slug} completed.`);
}

const orphanSlug = 'Sabri';
deleteOrphan(orphanSlug);
