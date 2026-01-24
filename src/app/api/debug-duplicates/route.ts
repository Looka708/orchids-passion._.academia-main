
import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();

    const { data } = await supabase
        .from('mcqs')
        .select('course_type, subject, chapter, question_number')
        .eq('course_type', 'class-10')
        .eq('subject', 'biology');

    const counts: Record<string, number> = {};
    data?.forEach(row => {
        const key = `${row.chapter} | ${row.question_number}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);

    return NextResponse.json({
        total: data?.length,
        duplicates: duplicates.map(([key, count]) => ({ key, count }))
    });
}
