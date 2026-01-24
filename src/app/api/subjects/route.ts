
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(request.url);
        const course_type = searchParams.get('course_type');

        let query = supabase
            .from('subjects')
            .select('*')
            .order('subject_name', { ascending: true });

        if (course_type) {
            query = query.eq('course_type', course_type);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch subjects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const body = await request.json();

        // Basic validation
        if (!body.subject_name || !body.course_type) {
            return NextResponse.json({ success: false, error: 'Subject name and Course Type are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('subjects')
            .insert([
                {
                    subject_name: body.subject_name,
                    course_type: body.course_type,
                    description: body.description || '',
                    icon_name: body.icon_name || 'BookOpen',
                }
            ])
            .select();

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create subject' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('subjects')
            .update({
                subject_name: body.subject_name,
                description: body.description,
                icon_name: body.icon_name,
            })
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update subject' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete subject' }, { status: 500 });
    }
}
