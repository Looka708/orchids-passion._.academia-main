const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAll() {
    const { data: classes } = await supabase.from('classes').select('*');
    console.log('\n--- All Database Classes ---');
    for (const cls of classes) {
        const { count } = await supabase
            .from('mcqs')
            .select('*', { count: 'exact', head: true })
            .eq('course_type', cls.slug);

        console.log(`${cls.name} (${cls.slug}) - ${count || 0} MCQs`);
    }
}

listAll();
