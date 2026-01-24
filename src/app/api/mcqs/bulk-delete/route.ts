
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: 'IDs array is required' }, { status: 400 });
        }

        const supabase = createServerClient();

        const { error } = await supabase
            .from('mcqs')
            .delete()
            .in('id', ids);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete MCQs' }, { status: 500 });
    }
}
