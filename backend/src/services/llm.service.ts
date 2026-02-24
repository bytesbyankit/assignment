import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export class LLMService {
    private static readonly PROMPT_PATH = path.join(__dirname, '../utils/llm_prompt.md');

    /**
     * Extracts tasks from transcript using an LLM (Gemini).
     */
    static async extractTasks(transcript: string): Promise<any> {
        const apiKey = process.env.LLM_API_KEY;

        const promptTemplate = fs.readFileSync(this.PROMPT_PATH, 'utf-8');
        const prompt = promptTemplate.replace('${transcript}', transcript);

        if (!apiKey || apiKey === 'your_api_key_here') {
            console.warn('LLM_API_KEY not set. Using mock response for demonstration.');
            return this.getMockResponse();
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            const result = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            const text = result.text;

            if (!text) {
                throw new Error('Empty response from LLM');
            }

            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', text);
                throw new Error('Invalid JSON response from LLM');
            }
        } catch (error: any) {
            console.error('LLM API Call failed:', error);
            if (error.status) {
                console.error('Error Status:', error.status);
            }
            throw new Error(`Failed to extract tasks from LLM: ${error.message || 'Unknown error'}`);
        }
    }

    private static getMockResponse() {
        return {
            tasks: [
                { id: "1", description: "Fix Stripe bug", priority: 1, dependencies: [] },
                { id: "2", description: "Run regression tests", priority: 1, dependencies: ["1"] }
            ]
        };
    }
}
