import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { data } = await supabase.from('mcqs').select('course_type, subject');

    const stats: Record<string, number> = {};
    data?.forEach(row => {
        const key = `${row.course_type} | ${row.subject}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    return NextResponse.json(stats);
}
