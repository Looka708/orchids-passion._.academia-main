import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials missing.'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { type, course_type, subject, chapter, old_name, new_name } = body;

    if (!type || !new_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let query = supabase.from("mcqs").update({});
    let updateData: Record<string, string> = {};
    let matchConditions: Record<string, string> = {};

    if (type === "subject") {
      if (!course_type || !old_name) {
        return NextResponse.json(
          { success: false, error: "Missing course_type or old_name for subject rename" },
          { status: 400 }
        );
      }
      updateData = { subject: new_name };
      matchConditions = { course_type, subject: old_name };
    } else if (type === "chapter") {
      if (!course_type || !subject || !old_name) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for chapter rename" },
          { status: 400 }
        );
      }
      updateData = { chapter: new_name };
      matchConditions = { course_type, subject, chapter: old_name };
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid rename type" },
        { status: 400 }
      );
    }

    const { data, error, count } = await supabase
      .from("mcqs")
      .update(updateData)
      .match(matchConditions)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      message: `Successfully renamed ${type} from "${old_name}" to "${new_name}"`,
    });
  } catch (error) {
    console.error("Rename error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to rename" },
      { status: 500 }
    );
  }
}
