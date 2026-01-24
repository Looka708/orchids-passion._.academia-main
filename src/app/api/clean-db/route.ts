
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST() {
    try {
        const supabase = createServerClient();

        // Truncate tables by deleting all records with a condition that's always true
        // Note: For some tables, we might want to preserve certain rows, but usually we want a full wipe.

        console.log("Starting full database cleanup...");

        const tables = ['mcqs', 'chapters', 'short_questions', 'long_questions', 'subjects'];
        const results: any = {};

        for (const table of tables) {
            const { errorCount, error } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

            if (error) {
                results[table] = { success: false, error: error.message };
            } else {
                results[table] = { success: true };
            }
        }

        return NextResponse.json({
            success: true,
            message: "Database cleanup completed",
            results
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
