import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { data } = await supabase
        .from('mcqs')
        .select('course_type, chapter')
        .eq('subject', 'biology');

    const results: any = {};
    data?.forEach(row => {
        const key = row.course_type;
        results[key] = (results[key] || 0) + 1;
    });

    return NextResponse.json(results);
}
