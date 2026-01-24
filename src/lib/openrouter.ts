/**
 * OpenRouter API Client
 * Provides a simple interface to interact with OpenRouter's API
 */

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
}

interface OpenRouterResponse {
    id: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class OpenRouterClient {
    private apiKey: string;
    private baseUrl = 'https://openrouter.ai/api/v1';
    private defaultModel: string;

    constructor(apiKey?: string, model?: string) {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
        this.defaultModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free';

        if (!this.apiKey && process.env.NODE_ENV === 'development') {
            console.warn('OpenRouter API key is missing. AI features will not work.');
        }
    }

    /**
     * Generate a completion using OpenRouter
     */
    async generateCompletion(
        prompt: string,
        systemPrompt?: string,
        options?: {
            temperature?: number;
            max_tokens?: number;
            model?: string;
        }
    ): Promise<string> {
        if (!this.apiKey) {
            console.warn('OpenRouter API key is required but was not provided. Returning dummy response.');
            return "OpenRouter API key is missing. Please configure it to enable AI features.";
        }
        const messages: OpenRouterMessage[] = [];

        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt,
            });
        }

        messages.push({
            role: 'user',
            content: prompt,
        });

        const requestBody: OpenRouterRequest = {
            model: options?.model || this.defaultModel,
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 2000,
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
                    'X-Title': 'Passion Academia',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''
                    }`
                );
            }

            const data: OpenRouterResponse = await response.json();

            if (!data.choices || data.choices.length === 0) {
                throw new Error('No response generated from OpenRouter');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenRouter API Error:', error);
            throw error;
        }
    }

    /**
     * Generate MCQs for a given topic
     */
    async generateMCQs(
        subject: string,
        chapter: string,
        count: number = 10
    ): Promise<string> {
        const systemPrompt = `You are an expert educator creating high-quality multiple-choice questions for students. 
Generate questions that test understanding, application, and critical thinking.`;

        const prompt = `Generate ${count} multiple-choice questions (MCQs) for the following:
Subject: ${subject}
Chapter: ${chapter}

Format each question as follows:
Q1. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]

Make the questions challenging but fair, covering different aspects of the chapter.`;

        return this.generateCompletion(prompt, systemPrompt, { max_tokens: 3000 });
    }

    /**
     * Generate short answer questions
     */
    async generateShortQuestions(
        subject: string,
        chapter: string,
        count: number = 5
    ): Promise<string> {
        const systemPrompt = `You are an expert educator creating short answer questions that require brief, focused responses.`;

        const prompt = `Generate ${count} short answer questions for the following:
Subject: ${subject}
Chapter: ${chapter}

Format each question as:
Q1. [Question text]

These questions should require 2-3 sentence answers and test key concepts.`;

        return this.generateCompletion(prompt, systemPrompt, { max_tokens: 2000 });
    }

    /**
     * Generate long answer questions
     */
    async generateLongQuestions(
        subject: string,
        chapter: string,
        count: number = 3
    ): Promise<string> {
        const systemPrompt = `You are an expert educator creating comprehensive long answer questions that require detailed explanations.`;

        const prompt = `Generate ${count} long answer questions for the following:
Subject: ${subject}
Chapter: ${chapter}

Format each question as:
Q1. [Question text]

These questions should require detailed, well-structured answers (5-7 sentences or more) and test deep understanding.`;

        return this.generateCompletion(prompt, systemPrompt, { max_tokens: 2000 });
    }
}

// Export a singleton instance
export const openRouterClient = new OpenRouterClient();
