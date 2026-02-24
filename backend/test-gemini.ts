import dotenv from 'dotenv';
import path from 'path';
import { LLMService } from './src/services/llm.service';

dotenv.config();

async function testGemini() {
    const transcript = `
    Alice: We need to fix the bug in the Stripe integration by Friday.
    Bob: I'll handle that. But I need the updated API documentation first.
    Alice: Sure, I'll send that over. Also, we should run regression tests once the fix is in.
    `;

    console.log('Testing Gemini Task Extraction...');
    try {
        const result = await LLMService.extractTasks(transcript);
        console.log('Gemini Response:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testGemini();
