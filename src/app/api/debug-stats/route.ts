import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { data: mcqs } = await supabase
        .from('mcqs')
        .select('course_type, subject, count')
        .limit(100);

    // Grouping by course_type and subject in code to see what's there
    const stats: Record<string, number> = {};
    const { data: allData } = await supabase.from('mcqs').select('course_type, subject');

    allData?.forEach(row => {
        const key = `${row.course_type} | ${row.subject}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    return NextResponse.json({ stats });
}
