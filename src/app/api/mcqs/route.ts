import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseType = searchParams.get('course_type');
  const subject = searchParams.get('subject');
  const chapter = searchParams.get('chapter');
  const search = searchParams.get('search');

  if (!courseType || !subject) {
    return NextResponse.json({ success: false, error: 'course_type and subject are required' }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    
    let query = supabase
      .from('mcqs')
      .select('*')
      .eq('course_type', courseType)
      .eq('subject', subject)
      .order('chapter')
      .order('question_number');

    if (chapter) {
      query = query.eq('chapter', chapter);
    }

    if (search) {
      query = query.ilike('question_text', `%${search}%`);
    }

    const { data, error } = await query.limit(500);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, mcqs: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch MCQs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_type, subject, chapter, question_text, options, correct_answer, language } = body;

    if (!course_type || !subject || !chapter || !options || !correct_answer) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: maxData } = await supabase
      .from('mcqs')
      .select('question_number')
      .eq('course_type', course_type)
      .eq('subject', subject)
      .eq('chapter', chapter)
      .order('question_number', { ascending: false })
      .limit(1);

    const nextQuestionNumber = maxData && maxData.length > 0 ? maxData[0].question_number + 1 : 1;

    const { data, error } = await supabase
      .from('mcqs')
      .insert({
        course_type,
        subject,
        chapter,
        question_number: nextQuestionNumber,
        question_text,
        options,
        correct_answer,
        language: language || 'english',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, mcq: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create MCQ' }, { status: 500 });
  }
}
