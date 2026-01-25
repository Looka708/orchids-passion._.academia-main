import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const courseType = searchParams.get('course_type');
    let subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');
    const ids = searchParams.get('ids');

    if (subject) {
        subject = decodeURIComponent(subject).replace(/-/g, ' ');
    }

    try {
        const supabase = createServerClient();

        let query = supabase
            .from('mcqs')
            .select('course_type, subject, chapter, question_text, options, correct_answer, language')
            .order('course_type')
            .order('subject')
            .order('chapter');

        if (ids) {
            query = query.in('id', ids.split(','));
        } else {
            if (courseType) {
                query = query.eq('course_type', courseType);
            }
            if (subject) {
                query = query.eq('subject', subject);
            }
            if (chapter) {
                query = query.eq('chapter', chapter);
            }
        }

        // Use a large limit for export, or implement pagination if needed.
        // For most MCQ apps, 10,000 is a safe upper bound for a single request.
        const { data, error } = await query.limit(10000);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ success: false, error: 'No MCQs found to export' }, { status: 404 });
        }

        // Convert to CSV
        const headers = ["Course", "Subject", "Chapter", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Language"];

        // Helper to escape CSV fields
        const escapeCsv = (val: any) => {
            if (val === null || val === undefined) return '';
            let str = String(val);
            if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = data.map((mcq: any) => [
            escapeCsv(mcq.course_type),
            escapeCsv(mcq.subject),
            escapeCsv(mcq.chapter),
            escapeCsv(mcq.question_text),
            escapeCsv(mcq.options[0]),
            escapeCsv(mcq.options[1]),
            escapeCsv(mcq.options[2]),
            escapeCsv(mcq.options[3]),
            escapeCsv(mcq.correct_answer),
            escapeCsv(mcq.language)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row: string[]) => row.join(","))
        ].join("\n");

        const BOM = "\uFEFF";
        const response = new NextResponse(BOM + csvContent, {
            headers: {
                'Content-Type': 'text/csv;charset=utf-8',
                'Content-Disposition': `attachment; filename="mcqs_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

        return response;
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ success: false, error: 'Failed to export MCQs' }, { status: 500 });
    }
}
