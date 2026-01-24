const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDuplicateNames() {
    const { data: classes } = await supabase.from('classes').select('*');
    const counts = {};
    classes.forEach(c => {
        const name = c.name.toLowerCase();
        if (!counts[name]) counts[name] = [];
        counts[name].push(c);
    });

    console.log('\n--- Duplicate Names in Classes Table ---');
    for (const name in counts) {
        if (counts[name].length > 1) {
            console.log(`\nName: ${name}`);
            for (const cls of counts[name]) {
                const { count } = await supabase.from('mcqs').select('*', { count: 'exact', head: true }).eq('course_type', cls.slug);
                console.log(`- Slug: ${cls.slug}, ID: ${cls.id}, MCQs: ${count || 0}`);
            }
        }
    }
}

checkDuplicateNames();
