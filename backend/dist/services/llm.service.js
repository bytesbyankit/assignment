"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const genai_1 = require("@google/genai");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LLMService {
    /**
     * Extracts tasks from transcript using an LLM (Gemini).
     */
    static async extractTasks(transcript, retries = 1, timeoutMs = 15000) {
        const apiKey = process.env.LLM_API_KEY;
        const promptTemplate = fs_1.default.readFileSync(this.PROMPT_PATH, 'utf-8');
        const prompt = promptTemplate.replace('${transcript}', transcript);
        if (!apiKey || apiKey === 'your_api_key_here') {
            console.warn('LLM_API_KEY not set. Using mock response for demonstration.');
            return this.getMockResponse();
        }
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const ai = new genai_1.GoogleGenAI({ apiKey });
                // Use Promise.race to enforce a strict timeout
                const result = await Promise.race([
                    ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                        }
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('LLM request timeout')), timeoutMs))
                ]);
                const text = result.text;
                if (!text) {
                    throw new Error('Empty response from LLM');
                }
                try {
                    return JSON.parse(text);
                }
                catch (parseError) {
                    console.error('Failed to parse Gemini response as JSON:', text);
                    throw new Error('Invalid JSON response from LLM');
                }
            }
            catch (error) {
                console.error(`LLM API Call failed (attempt ${attempt + 1}):`, error.message);
                if (error.status) {
                    console.error('Error Status:', error.status);
                }
                if (attempt === retries) {
                    console.error('All LLM retries failed. Returning graceful error response.');
                    // Fail gracefully by returning an object with an error property
                    // This will fail validation downstream and safely mark job as error without crashing
                    return { error: `Failed to extract tasks from LLM: ${error.message || 'Unknown error'}` };
                }
                // Wait briefly before retrying (1 second delay)
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    }
    static getMockResponse() {
        return {
            tasks: [
                { id: "1", description: "Fix Stripe bug", priority: 1, dependencies: [] },
                { id: "2", description: "Run regression tests", priority: 1, dependencies: ["1"] }
            ]
        };
    }
}
exports.LLMService = LLMService;
LLMService.PROMPT_PATH = path_1.default.join(__dirname, '../utils/llm_prompt.md');
//# sourceMappingURL=llm.service.js.map