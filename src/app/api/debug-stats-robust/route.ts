
import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const stats: Record<string, number> = {};

    try {
        // Fetch all unique course/subject combinations
        const { data, error } = await supabase
            .from('mcqs')
            .select('course_type, subject');

        if (error) throw error;

        // Count occurrences
        data.forEach(row => {
            const key = `${row.course_type} | ${row.subject}`;
            stats[key] = (stats[key] || 0) + 1;
        });

        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
