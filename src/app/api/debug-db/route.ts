
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                success: false,
                error: 'Supabase credentials missing. This route requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase
            .from("mcqs")
            .select("course_type, subject")
            .limit(100);

        if (error) throw error;

        // Get unique course types
        const uniqueCourses = [...new Set(data.map((item: any) => item.course_type))];
        const uniqueSubjects = [...new Set(data.map((item: any) => item.subject))];

        return NextResponse.json({
            success: true,
            unique_courses: uniqueCourses,
            unique_subjects: uniqueSubjects,
            sample_rows: data.slice(0, 5)
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
