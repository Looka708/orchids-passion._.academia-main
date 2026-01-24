import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ course: string; subject: string }> }
) {
    const { course, subject } = await params;

    if (!course || !subject) {
        return NextResponse.json({ success: false, error: 'course and subject are required' }, { status: 400 });
    }

    try {
        const supabase = createServerClient();

        // 1. Fetch from 'chapters' table (case-insensitive search)
        const { data: chapterData } = await supabase
            .from('chapters')
            .select('chapter_name')
            .ilike('course_type', course)
            .ilike('subject', subject);

        // 2. Fetch from 'mcqs' table (case-insensitive search)
        const { data: mcqData } = await supabase
            .from('mcqs')
            .select('chapter')
            .ilike('course_type', course)
            .ilike('subject', subject);

        // 3. Combine and Deduplicate
        const managedChapters = chapterData?.map(d => d.chapter_name) || [];
        const mcqChapters = mcqData?.map(d => d.chapter) || [];

        const uniqueChaptersSet = new Set<string>();
        const finalChapters: string[] = [];

        // Add managed chapters first
        managedChapters.forEach(c => {
            if (!uniqueChaptersSet.has(c.toLowerCase())) {
                uniqueChaptersSet.add(c.toLowerCase());
                finalChapters.push(c);
            }
        });

        // Add remaining MCQ chapters
        mcqChapters.forEach(c => {
            if (!uniqueChaptersSet.has(c.toLowerCase())) {
                uniqueChaptersSet.add(c.toLowerCase());
                finalChapters.push(c);
            }
        });

        // Sort naturally (numeric aware sort would be better but alpha is standard)
        return NextResponse.json({ success: true, chapters: finalChapters.sort() });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch chapters' }, { status: 500 });
    }
}
