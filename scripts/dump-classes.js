const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dumpClasses() {
    const { data: classes } = await supabase.from('classes').select('*').order('name');
    console.log(JSON.stringify(classes, null, 2));
}

dumpClasses();
