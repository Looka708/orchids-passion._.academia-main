import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Generate prompt for daily quiz
        const prompt = `Generate 10 multiple choice questions for a daily quiz challenge. 
        
The questions should be:
- Mixed topics: general knowledge, science, history, mathematics, current affairs
- Appropriate for high school/college students
- Engaging and educational
- Varied difficulty levels (easy to medium)

CRITICAL REQUIREMENTS:
- Generate EXACTLY 10 Multiple Choice Questions (MCQs) - no more, no less
- Each question must have exactly 4 options
- Only one correct answer per question

Format your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "questionText": "question here",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option text (must match one of the options exactly)"
    }
  ]
}

IMPORTANT: 
- Return ONLY the JSON object, no additional text or markdown
- Ensure the correctAnswer matches one of the options EXACTLY
- Make questions interesting and educational`;

        // Call Grok API via OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://passion-academia.com',
                'X-Title': 'Passion Academia Daily Quiz',
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4.1-fast',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert educational content creator specializing in generating engaging quiz questions. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 3000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Grok API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate quiz questions', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: 'No content generated' }, { status: 500 });
        }

        // Parse the JSON response
        let quizData;
        try {
            // Remove markdown code blocks if present
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            quizData = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            return NextResponse.json(
                { error: 'Failed to parse AI response', details: content },
                { status: 500 }
            );
        }

        // Validate the generated questions
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            return NextResponse.json(
                { error: 'Invalid quiz format', details: 'Missing questions array' },
                { status: 500 }
            );
        }

        // Ensure we have exactly 10 questions
        const questions = quizData.questions.slice(0, 10);

        // Add metadata
        const response_data = {
            questions,
            userId,
            generatedAt: new Date().toISOString(),
            totalQuestions: questions.length
        };

        return NextResponse.json(response_data);
    } catch (error: any) {
        console.error('Error generating daily quiz:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
