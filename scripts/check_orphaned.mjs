
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkOrphaned() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase URL or Key");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching classes...");
    const { data: classes, error: classError } = await supabase.from('classes').select('slug, name');
    if (classError) {
        console.error("Error fetching classes:", classError);
        return;
    }
    const classSlugs = new Set(classes?.map(c => c.slug));
    console.log("Existing classes in DB:", Array.from(classSlugs));

    console.log("\nFetching MCQ structure...");
    const { data: allMcqs } = await supabase.from('mcqs').select('course_type');
    const mcqCourseTypes = new Set(allMcqs?.map(m => m.course_type));
    console.log("Course types in MCQs table:", Array.from(mcqCourseTypes));

    console.log("\nOrphaned course types (in MCQs but not in Classes):");
    const orphaned = Array.from(mcqCourseTypes).filter(slug => !classSlugs.has(slug));
    console.log(orphaned);

    if (orphaned.length > 0) {
        console.log("\nCounts for orphaned types:");
        for (const slug of orphaned) {
            const { count } = await supabase.from('mcqs').select('*', { count: 'exact', head: true }).eq('course_type', slug);
            console.log(`${slug}: ${count} MCQs`);
        }
    } else {
        console.log("\nNo orphaned classes found in MCQs table.");
    }
}

checkOrphaned();
