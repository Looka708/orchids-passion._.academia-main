import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createServerClient();
    const { data: allData } = await supabase.from('mcqs').select('course_type, subject');

    const stats: any = {};
    allData?.forEach((row: any) => {
        const key = `${row.course_type} | ${row.subject}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    return NextResponse.json({
        total: allData?.length,
        class10_biology: stats['class-10 | biology'],
        class9_biology: stats['class-9 | biology'],
        keys: Object.keys(stats).filter(k => k.includes('biology'))
    });
}
