
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ course: string }> }
) {
    const { course } = await params;

    if (!course) {
        return NextResponse.json({ success: false, error: 'course is required' }, { status: 400 });
    }

    try {
        const supabase = createServerClient();

        // 1. Fetch from 'subjects' table
        const { data: subjectData } = await supabase
            .from('subjects')
            .select('subject_name')
            .ilike('course_type', course);

        // 2. Fetch from 'mcqs' table
        const { data: mcqData } = await supabase
            .from('mcqs')
            .select('subject')
            .ilike('course_type', course);

        // 3. Combine and Deduplicate
        const managedSubjects = subjectData?.map(s => s.subject_name) || [];
        const mcqSubjects = mcqData?.map(m => m.subject) || [];

        // Case-insensitive deduplication, preferring the display case from 'subjects' table
        const uniqueSubjectsSet = new Set<string>();
        const finalSubjects: string[] = [];

        // Add managed subjects first (they have the preferred casing)
        managedSubjects.forEach(s => {
            const lower = s.toLowerCase();
            if (!uniqueSubjectsSet.has(lower)) {
                uniqueSubjectsSet.add(lower);
                finalSubjects.push(s);
            }
        });

        // Add remaining MCQ subjects
        mcqSubjects.forEach(s => {
            const lower = s.toLowerCase();
            if (!uniqueSubjectsSet.has(lower)) {
                uniqueSubjectsSet.add(lower);
                finalSubjects.push(s);
            }
        });

        return NextResponse.json({ success: true, subjects: finalSubjects.sort() });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch subjects' }, { status: 500 });
    }
}
