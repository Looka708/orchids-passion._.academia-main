import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { data: chapters } = await supabase
        .from('mcqs')
        .select('chapter')
        .eq('course_type', 'class-10')
        .eq('subject', 'biology');

    const uniqueChapters = [...new Set(chapters?.map(c => c.chapter))];

    return NextResponse.json({ uniqueChapters });
}
