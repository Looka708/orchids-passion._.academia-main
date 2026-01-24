
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
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
