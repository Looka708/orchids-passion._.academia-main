import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: stats, error: statsError } = await supabase
      .from('mcqs')
      .select('course_type, subject')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        if (!data) return { data: [], error: null };

        const counts: Record<string, { course_type: string; subject: string; count: number }> = {};

        for (const row of data) {
          const key = `${row.course_type}-${row.subject}`;
          if (!counts[key]) {
            counts[key] = { course_type: row.course_type, subject: row.subject, count: 0 };
          }
          counts[key].count++;
        }

        return {
          data: Object.values(counts).sort((a, b) => b.count - a.count),
          error: null
        };
      });

    const { count: total, error: countError } = await supabase
      .from('mcqs')
      .select('*', { count: 'exact', head: true });

    if (statsError || countError) {
      return NextResponse.json({
        success: false,
        error: statsError?.message || countError?.message
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, stats, total });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
