
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET() {
    const supabase = createServerClient();
    try {
        // Fetch all rows by increasing limit significantly. 
        // Note: For very large datasets, pagination is standard, but for 20k rows, this might pass depending on Supabase config.
        // Standard max is usually 1000. We can try setting a higher range.

        let allData: any[] = [];
        let from = 0;
        const step = 1000;

        while (true) {
            const { data, error } = await supabase
                .from('mcqs')
                .select('course_type, subject')
                .range(from, from + step - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                if (data.length < step) break; // Reached end
                from += step;
            } else {
                break;
            }
        }

        const summary: Record<string, Record<string, number>> = {};

        allData.forEach(row => {
            if (!summary[row.course_type]) summary[row.course_type] = {};
            summary[row.course_type][row.subject] = (summary[row.course_type][row.subject] || 0) + 1;
        });

        return NextResponse.json({ success: true, total: allData.length, summary });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
