import { validateLLMOutput } from '../utils/validator';
import * as fs from 'fs';
import * as path from 'path';

const testValidation = () => {
    const filePath = path.join(__dirname, '../tests/expected_output.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    console.log('Validating expected_output.json...');
    const result = validateLLMOutput(jsonData);

    if (result.success) {
        console.log('✅ Validation successful!');
    } else {
        console.error('❌ Validation failed:');
        result.errors.forEach(err => console.error(` - ${err}`));
    }

    console.log('\nTesting invalid data...');
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
    if (!invalidResult.success) {
        console.log('✅ Correctly identified invalid data:');
        invalidResult.errors.forEach(err => console.log(` - ${err}`));
    }
};

testValidation();
