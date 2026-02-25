import { validateLLMOutput } from '../utils/validator';
import * as fs from 'fs';
import * as path from 'path';

describe('Validator Tests', () => {
    it('should validate expected_output.json correctly', () => {
        const filePath = path.join(__dirname, 'expected_output.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(rawData);

        const result = validateLLMOutput(jsonData);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data).toBeDefined();
    });

    it('should identify missing fields in invalid data', () => {
        const invalidData = {
            tasks: [
                {
                    id: "task-1",
                    description: "Missing fields",
                    // priority missing
                    // dependencies missing
                    extra: "field"
                }
            ]
        };

        const invalidResult = validateLLMOutput(invalidData);
        expect(invalidResult.success).toBe(false);

        if (!invalidResult.success) {
            expect(invalidResult.errors.length).toBeGreaterThan(0);

            // Detailed checks on specific errors
            const errorStrings = invalidResult.errors.join(', ');
            expect(errorStrings).toContain("must have required property 'priority'");
            expect(errorStrings).toContain("must have required property 'dependencies'");
        }
    });
});
