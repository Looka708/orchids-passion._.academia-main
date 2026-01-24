import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = supabase
            .from('classes')
            .select('*')
            .order('display_order', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch classes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('classes')
            .insert([
                {
                    name: body.name,
                    slug: body.slug,
                    description: body.description,
                    category: body.category,
                    icon: body.icon,
                    display_order: body.display_order || 0,
                }
            ])
            .select();

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create class' }, { status: 500 });
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

        // 1. Fetch the class to get its slug before deleting
        const { data: classData, error: fetchError } = await supabase
            .from('classes')
            .select('slug')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
        }

        const slug = classData.slug;

        // 2. Delete associated data from other tables
        // We do this first to maintain integrity (if any constraints existed)
        // and because we need the slug.
        await Promise.all([
            supabase.from('mcqs').delete().eq('course_type', slug),
            supabase.from('short_questions').delete().eq('course_type', slug),
            supabase.from('long_questions').delete().eq('course_type', slug),
            supabase.from('subjects').delete().eq('course_type', slug),
            supabase.from('chapters').delete().eq('course_type', slug),
        ]);

        // 3. Delete the class itself
        const { error: deleteError } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Class ${slug} and all associated data deleted.` });
    } catch (error) {
        console.error("Delete class error:", error);
        return NextResponse.json({ success: false, error: 'Failed to delete class' }, { status: 500 });
    }
}
