
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkAllOrphaned() {
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

    console.log("\nFetching ALL MCQ course types...");
    const mcqCourseTypes = new Set();
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('mcqs')
            .select('course_type')
            .range(from, from + pageSize - 1);

        if (error) {
            console.error("Error fetching MCQs:", error);
            break;
        }

        if (data && data.length > 0) {
            data.forEach(m => mcqCourseTypes.add(m.course_type));
            from += pageSize;
            hasMore = data.length === pageSize;
        } else {
            hasMore = false;
        }
    }

    console.log("Course types found in MCQs table:", Array.from(mcqCourseTypes));

    const orphaned = Array.from(mcqCourseTypes).filter(slug => !classSlugs.has(slug));
    console.log("\nOrphaned course types (in MCQs but not in Classes):");
    console.log(orphaned);

    if (orphaned.length > 0) {
        console.log("\nCounts for orphaned types:");
        for (const slug of orphaned) {
            const { count } = await supabase.from('mcqs').select('*', { count: 'exact', head: true }).eq('course_type', slug);
            console.log(`${slug}: ${count} MCQs`);
        }

        console.log("\nTo delete these MCQs, you can use the following slugs in a delete command.");
    } else {
        console.log("\nNo orphaned classes found in MCQs table.");
    }
}

checkAllOrphaned();
