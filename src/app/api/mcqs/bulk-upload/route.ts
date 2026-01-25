import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseType = formData.get('course_type') as string;
    const subject = formData.get('subject') as string;

    if (!file || !courseType || !subject) {
      return NextResponse.json(
        { success: false, error: 'File, course_type, and subject are required' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    let workbook;
    if (isCsv) {
      // For CSV, read as UTF-8 string explicitly to avoid encoding issues like Ø³ÙØ±
      const decoder = new TextDecoder('utf-8');
      const csvString = decoder.decode(buffer);
      workbook = XLSX.read(csvString, { type: 'string' });
    } else {
      // For XLSX, the standard array buffer read is robust
      workbook = XLSX.read(buffer, { type: 'array' });
    }
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const mcqsToInsert: Array<{
      course_type: string;
      subject: string;
      chapter: string;
      question_number: number;
      question_text: string | null;
      options: string[];
      correct_answer: string;
      language: string;
    }> = [];

    const errors: Array<{ row: number; error: string }> = [];
    const chapterCounts: Record<string, number> = {};

    const { data: existingMcqs } = await supabase
      .from('mcqs')
      .select('chapter, question_number')
      .eq('course_type', courseType)
      .eq('subject', subject);

    if (existingMcqs) {
      existingMcqs.forEach((mcq: any) => {
        if (!chapterCounts[mcq.chapter] || mcq.question_number > chapterCounts[mcq.chapter]) {
          chapterCounts[mcq.chapter] = mcq.question_number;
        }
      });
    }

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      const rowNum = i + 2;

      const chapter = String(row['Chapter'] || row['chapter'] || '').trim();
      const questionText = String(row['Question'] || row['question'] || row['Question Text'] || row['question_text'] || '').trim();
      const optionA = String(row['Option A'] || row['option_a'] || row['A'] || row['a'] || '').trim();
      const optionB = String(row['Option B'] || row['option_b'] || row['B'] || row['b'] || '').trim();
      const optionC = String(row['Option C'] || row['option_c'] || row['C'] || row['c'] || '').trim();
      const optionD = String(row['Option D'] || row['option_d'] || row['D'] || row['d'] || '').trim();
      const correctAnswer = String(row['Correct Answer'] || row['correct_answer'] || row['Answer'] || row['answer'] || '').trim();
      const language = String(row['Language'] || row['language'] || 'english').trim().toLowerCase();

      if (!chapter) {
        errors.push({ row: rowNum, error: 'Chapter is required' });
        continue;
      }

      if (!questionText) {
        errors.push({ row: rowNum, error: 'Question text is required' });
        continue;
      }

      const options = [optionA, optionB, optionC, optionD].filter(Boolean);
      if (options.length < 2) {
        errors.push({ row: rowNum, error: 'At least 2 options are required' });
        continue;
      }

      let resolvedCorrectAnswer = correctAnswer;
      const correctAnswerUpper = correctAnswer.toUpperCase();
      if (correctAnswerUpper === 'A' && optionA) resolvedCorrectAnswer = optionA;
      else if (correctAnswerUpper === 'B' && optionB) resolvedCorrectAnswer = optionB;
      else if (correctAnswerUpper === 'C' && optionC) resolvedCorrectAnswer = optionC;
      else if (correctAnswerUpper === 'D' && optionD) resolvedCorrectAnswer = optionD;

      if (!resolvedCorrectAnswer || !options.includes(resolvedCorrectAnswer)) {
        errors.push({ row: rowNum, error: 'Correct answer must match one of the options' });
        continue;
      }

      if (!chapterCounts[chapter]) {
        chapterCounts[chapter] = 0;
      }
      chapterCounts[chapter]++;

      mcqsToInsert.push({
        course_type: courseType,
        subject,
        chapter,
        question_number: chapterCounts[chapter],
        question_text: questionText || null,
        options,
        correct_answer: resolvedCorrectAnswer,
        language,
      });
    }

    if (mcqsToInsert.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid MCQs to insert', errors },
        { status: 400 }
      );
    }

    const batchSize = 100;
    let insertedCount = 0;
    const insertErrors: string[] = [];

    for (let i = 0; i < mcqsToInsert.length; i += batchSize) {
      const batch = mcqsToInsert.slice(i, i + batchSize);
      const { error } = await supabase.from('mcqs').insert(batch);

      if (error) {
        insertErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        insertedCount += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${insertedCount} MCQs`,
      total_rows: jsonData.length,
      inserted: insertedCount,
      skipped: errors.length,
      validation_errors: errors.slice(0, 10),
      insert_errors: insertErrors,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}
