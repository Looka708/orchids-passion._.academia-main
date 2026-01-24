import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const allData: { course_type: string; subject: string; chapter: string }[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("mcqs")
        .select("course_type, subject, chapter")
        .range(from, from + pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allData.push(...data);
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    const structure: Record<string, Record<string, { chapters: string[]; count: number }>> = {};
    const counts: Record<string, Record<string, Record<string, number>>> = {};

    allData.forEach((row) => {
      if (!structure[row.course_type]) {
        structure[row.course_type] = {};
        counts[row.course_type] = {};
      }
      if (!structure[row.course_type][row.subject]) {
        structure[row.course_type][row.subject] = { chapters: [], count: 0 };
        counts[row.course_type][row.subject] = {};
      }
      if (!structure[row.course_type][row.subject].chapters.includes(row.chapter)) {
        structure[row.course_type][row.subject].chapters.push(row.chapter);
      }
      structure[row.course_type][row.subject].count++;
      counts[row.course_type][row.subject][row.chapter] = 
        (counts[row.course_type][row.subject][row.chapter] || 0) + 1;
    });

    const result = Object.entries(structure).map(([courseType, subjects]) => ({
      course_type: courseType,
      subjects: Object.entries(subjects).map(([subjectName, subjectData]) => ({
        name: subjectName,
        count: subjectData.count,
        chapters: subjectData.chapters.map((ch) => ({
          name: ch,
          count: counts[courseType][subjectName][ch] || 0,
        })),
      })),
    }));

    return NextResponse.json({ success: true, structure: result });
  } catch (error) {
    console.error("Structure error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch structure" },
      { status: 500 }
    );
  }
}
