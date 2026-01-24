const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCorrectClasses() {
    const classesToAdd = [
        { name: "Class 6", slug: "class-6", description: "Building strong foundational skills for future success.", category: "academic", icon: "GraduationCap", display_order: 1 },
        { name: "Class 7", slug: "class-7", description: "Expanding knowledge and critical thinking abilities.", category: "academic", icon: "GraduationCap", display_order: 2 },
        { name: "Class 8", slug: "class-8", description: "Preparing for higher-level concepts and board examinations.", category: "academic", icon: "GraduationCap", display_order: 3 },
        { name: "Class 9", slug: "class-9", description: "In-depth mastery for secondary school certification.", category: "academic", icon: "GraduationCap", display_order: 4 },
        { name: "Class 10", slug: "class-10", description: "Comprehensive preparation for matriculation board exams.", category: "academic", icon: "GraduationCap", display_order: 5 },
        { name: "Class 11", slug: "class-11", description: "Specialized streams for higher secondary education.", category: "academic", icon: "GraduationCap", display_order: 6 },
        { name: "Class 12", slug: "class-12", description: "Advanced studies and final preparation for entrance.", category: "academic", icon: "GraduationCap", display_order: 7 },
        { name: "MCM", slug: "mcm", description: "Military College Murree entrance preparation.", category: "special", icon: "ShieldCheck", display_order: 12 }
    ];

    console.log('Adding correct class entries to database...');

    for (const cls of classesToAdd) {
        const { data: existing } = await supabase.from('classes').select('*').eq('slug', cls.slug).single();

        if (!existing) {
            const { error } = await supabase.from('classes').insert([cls]);
            if (error) {
                console.error(`Error adding ${cls.slug}:`, error);
            } else {
                console.log(`Added: ${cls.name} (${cls.slug})`);
            }
        } else {
            console.log(`Skipped: ${cls.name} (${cls.slug}) already exists.`);
        }
    }
}

addCorrectClasses();
