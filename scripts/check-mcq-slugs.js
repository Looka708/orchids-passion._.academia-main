const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMcqSlugs() {
    const { data: mcqs } = await supabase.from('mcqs').select('course_type');
    const slugs = new Set(mcqs.map(m => m.course_type));
    console.log('\n--- Slugs used in MCQs table ---');
    slugs.forEach(s => console.log(s));
}

checkMcqSlugs();
