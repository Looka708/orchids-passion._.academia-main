const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('Fetching all classes...');
    const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*');

    if (classesError) {
        console.error('Error fetching classes:', classesError);
        return;
    }

    console.log(`Found ${classes.length} classes.`);

    const stats = [];

    for (const cls of classes) {
        const { count, error: mcqError } = await supabase
            .from('mcqs')
            .select('*', { count: 'exact', head: true })
            .eq('course_type', cls.slug);

        if (mcqError) {
            console.error(`Error fetching MCQs for ${cls.slug}:`, mcqError);
            continue;
        }

        stats.push({
            id: cls.id,
            name: cls.name,
            slug: cls.slug,
            mcqCount: count || 0
        });
    }

    // Group by name/slug to find duplicates
    const grouped = {};
    stats.forEach(s => {
        const key = s.slug.toLowerCase();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(s);
    });

    console.log('\n--- Analysis ---');
    const toDelete = [];
    const kept = [];

    for (const key in grouped) {
        const group = grouped[key];
        if (group.length > 1) {
            console.log(`\nDuplicate Group: ${key}`);
            // Sort: keep the one with most MCQs, or the first one if all 0
            group.sort((a, b) => b.mcqCount - a.mcqCount);

            const best = group[0];
            console.log(`- KEEPING: ${best.name} (${best.slug}) [ID: ${best.id}] - ${best.mcqCount} MCQs`);
            kept.push(best);

            for (let i = 1; i < group.length; i++) {
                const other = group[i];
                if (other.mcqCount === 0) {
                    console.log(`- TO DELETE: ${other.name} (${other.slug}) [ID: ${other.id}] - ${other.mcqCount} MCQs (Duplicate)`);
                    toDelete.push(other);
                } else {
                    console.log(`- WARNING: ${other.name} (${other.slug}) [ID: ${other.id}] - ${other.mcqCount} MCQs (Has data, keeping)`);
                    kept.push(other);
                }
            }
        } else {
            kept.push(group[0]);
        }
    }

    console.log(`\nFound ${toDelete.length} duplicates with 0 MCQs to delete.`);

    if (toDelete.length > 0) {
        console.log('\nProceeding with deletion...');
        for (const item of toDelete) {
            const { error: deleteError } = await supabase
                .from('classes')
                .delete()
                .eq('id', item.id);

            if (deleteError) {
                console.error(`Error deleting ${item.slug} (${item.id}):`, deleteError);
            } else {
                console.log(`Successfully deleted: ${item.name} (${item.slug})`);
            }
        }
    } else {
        console.log('No eligible duplicates found to delete.');
    }

    console.log('\nFinal Stats check:');
    const uniqueSlugs = new Set(kept.map(k => k.slug));
    console.log(`Unique classes remaining: ${uniqueSlugs.size}`);
}

cleanup();
