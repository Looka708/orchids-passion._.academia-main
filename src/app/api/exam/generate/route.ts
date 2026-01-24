import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subject, chapter, mcqCount = 10, shortCount = 5, longCount = 3 } = body;

        // Validate required fields
        if (!subject || !chapter) {
            return NextResponse.json(
                { error: 'Subject and chapter are required' },
                { status: 400 }
            );
        }

        // Initialize OpenRouter client
        const client = new OpenRouterClient();

        // Generate all three types of questions in parallel
        const [mcqs, shortQuestions, longQuestions] = await Promise.all([
            client.generateMCQs(subject, chapter, mcqCount),
            client.generateShortQuestions(subject, chapter, shortCount),
            client.generateLongQuestions(subject, chapter, longCount),
        ]);

        // Combine into a single exam paper
        const examPaper = {
            subject,
            chapter,
            generatedAt: new Date().toISOString(),
            sections: {
                mcqs: {
                    title: 'Section A: Multiple Choice Questions',
                    content: mcqs,
                    count: mcqCount,
                },
                shortQuestions: {
                    title: 'Section B: Short Answer Questions',
                    content: shortQuestions,
                    count: shortCount,
                },
                longQuestions: {
                    title: 'Section C: Long Answer Questions',
                    content: longQuestions,
                    count: longCount,
                },
            },
        };

        return NextResponse.json({
            success: true,
            examPaper,
        });
    } catch (error) {
        console.error('Error generating exam:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            {
                error: 'Failed to generate exam paper',
                details: errorMessage
            },
            { status: 500 }
        );
    }
}
