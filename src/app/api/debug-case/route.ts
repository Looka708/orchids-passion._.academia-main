import { createServerClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { count: lower } = await supabase
        .from('mcqs')
        .select('*', { count: 'exact', head: true })
        .eq('subject', 'biology');

    const { count: upper } = await supabase
        .from('mcqs')
        .select('*', { count: 'exact', head: true })
        .eq('subject', 'Biology');

    return NextResponse.json({ lower, upper });
}
