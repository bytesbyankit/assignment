import { GoogleGenerativeAI } from '@google/generative-ai';
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
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(text);

            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', text);
                throw new Error('Invalid JSON response from LLM');
            }
        } catch (error) {
            console.error('LLM API Call failed:', error);
            throw new Error('Failed to extract tasks from LLM');
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
