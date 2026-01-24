import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { course, subject, chapters, numMcqs, numShortQuestions, numLongQuestions } = await request.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Build the prompt for AI model
        const chaptersText = chapters.join(', ');
        const prompt = `You are an expert exam question generator for ${course} - ${subject}.

Generate exam questions for the following chapters: ${chaptersText}

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${numMcqs} Multiple Choice Questions (MCQs) - no more, no less
- Generate EXACTLY ${numShortQuestions} Short Answer Questions - no more, no less
- Generate EXACTLY ${numLongQuestions} Long Answer Questions - no more, no less

Format your response as a JSON object with this exact structure:
{
  "mcqs": [
    {
      "questionText": "question here",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option text"
    }
  ],
  "shortQuestions": ["question 1", "question 2"],
  "longQuestions": ["question 1", "question 2"]
}

Quality Guidelines:
1. MCQs must be clear and have only one correct answer
2. All MCQ options must be plausible and well-formatted
3. Questions must cover different topics from the chapters
4. Questions must be academically rigorous and appropriate for ${course} level
5. Ensure proper grammar and formatting
6. Make questions challenging but fair

IMPORTANT: 
- Return ONLY the JSON object, no additional text or markdown
- Ensure the arrays contain the EXACT number of questions requested
- Double-check your counts before responding`;

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://passion-academia.com',
                'X-Title': 'Passion Academia Exam Generator',
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert educational content creator specializing in generating high-quality exam questions. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 8000, // Increased for larger exams
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:');
            console.error('Status:', response.status, response.statusText);
            console.error('Response:', errorData);
            console.error('API Key exists:', !!apiKey);
            console.error('Model:', process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free');

            return NextResponse.json(
                {
                    error: 'Failed to generate questions',
                    details: errorData,
                    status: response.status,
                    statusText: response.statusText
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: 'No content generated' }, { status: 500 });
        }

        // Parse the JSON response
        let generatedQuestions;
        try {
            // Remove markdown code blocks if present
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            generatedQuestions = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            return NextResponse.json(
                { error: 'Failed to parse AI response', details: content },
                { status: 500 }
            );
        }

        // Validate the generated questions
        const actualMcqs = generatedQuestions.mcqs?.length || 0;
        const actualShortQuestions = generatedQuestions.shortQuestions?.length || 0;
        const actualLongQuestions = generatedQuestions.longQuestions?.length || 0;

        // Ensure arrays exist
        generatedQuestions.mcqs = generatedQuestions.mcqs || [];
        generatedQuestions.shortQuestions = generatedQuestions.shortQuestions || [];
        generatedQuestions.longQuestions = generatedQuestions.longQuestions || [];

        // Add metadata about what was generated vs requested
        const apiResponse = {
            ...generatedQuestions,
            metadata: {
                requested: {
                    mcqs: numMcqs,
                    shortQuestions: numShortQuestions,
                    longQuestions: numLongQuestions
                },
                generated: {
                    mcqs: actualMcqs,
                    shortQuestions: actualShortQuestions,
                    longQuestions: actualLongQuestions
                },
                warnings: [] as string[]
            }
        };

        // Add warnings if counts don't match
        if (actualMcqs < numMcqs) {
            apiResponse.metadata.warnings.push(`Only ${actualMcqs} MCQs generated instead of ${numMcqs} requested`);
        }
        if (actualShortQuestions < numShortQuestions) {
            apiResponse.metadata.warnings.push(`Only ${actualShortQuestions} short questions generated instead of ${numShortQuestions} requested`);
        }
        if (actualLongQuestions < numLongQuestions) {
            apiResponse.metadata.warnings.push(`Only ${actualLongQuestions} long questions generated instead of ${numLongQuestions} requested`);
        }

        return NextResponse.json(apiResponse);
    } catch (error: any) {
        console.error('Error generating questions:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
