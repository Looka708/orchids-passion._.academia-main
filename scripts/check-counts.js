const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCounts() {
    const slugs = ['6', '7', '8', '9', '10', '11', '12', 'afns', 'paf', 'mcj', 'Sabri'];
    console.log('\n--- Accurate Individual Counts ---');
    for (const s of slugs) {
        const { count } = await supabase.from('mcqs').select('*', { count: 'exact', head: true }).eq('course_type', s);
        console.log(`${s}: ${count || 0}`);
    }

    // Also check if they exist under 'class-X' slugs
    console.log('\n--- Checking potential alternative slugs ---');
    for (let i = 6; i <= 12; i++) {
        const s = `class-${i}`;
        const { count } = await supabase.from('mcqs').select('*', { count: 'exact', head: true }).eq('course_type', s);
        console.log(`${s}: ${count || 0}`);
    }
}

checkCounts();
