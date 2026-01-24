import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify OpenRouter API configuration
 * Access at: /api/test-openrouter
 */
export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free';

        // Check if API key exists
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'OPENROUTER_API_KEY not found in environment variables',
                envCheck: {
                    apiKeyExists: false,
                    model: model,
                }
            }, { status: 500 });
        }

        // Test a simple API call
        const testPrompt = 'Say "Hello, OpenRouter is working!" and nothing else.';

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
                'X-Title': 'Passion Academia - API Test',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: testPrompt
                    }
                ],
                max_tokens: 50,
            }),
        });

        const responseText = await response.text();
        let responseData;

        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = { raw: responseText };
        }

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: 'OpenRouter API returned an error',
                details: {
                    status: response.status,
                    statusText: response.statusText,
                    response: responseData,
                    apiKeyPrefix: apiKey.substring(0, 10) + '...',
                    model: model,
                }
            }, { status: response.status });
        }

        const content = responseData.choices?.[0]?.message?.content;

        return NextResponse.json({
            success: true,
            message: 'OpenRouter API is working correctly!',
            testResponse: content,
            config: {
                model: model,
                apiKeyPrefix: apiKey.substring(0, 10) + '...',
                apiKeyLength: apiKey.length,
            },
            usage: responseData.usage,
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Test failed with exception',
            details: {
                message: error.message,
                stack: error.stack,
            }
        }, { status: 500 });
    }
}
