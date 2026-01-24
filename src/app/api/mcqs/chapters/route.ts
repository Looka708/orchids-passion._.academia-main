import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseType = searchParams.get('course_type');
  const subject = searchParams.get('subject');

  if (!courseType || !subject) {
    return NextResponse.json({ success: false, error: 'course_type and subject are required' }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('mcqs')
      .select('chapter')
      .eq('course_type', courseType)
      .eq('subject', subject);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const uniqueChapters = [...new Set(data?.map(d => d.chapter))].sort();

    return NextResponse.json({ success: true, chapters: uniqueChapters });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch chapters' }, { status: 500 });
  }
}
