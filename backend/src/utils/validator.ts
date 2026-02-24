import Ajv from "ajv";
import { llmOutputSchema, LLMOutput } from "./schema";

const ajv = new Ajv({ allErrors: true });

const validateInternal = ajv.compile(llmOutputSchema);

export const validateLLMOutput = (data: any): { success: true; data: LLMOutput } | { success: false; errors: string[] } => {
    const isValid = validateInternal(data);

    if (isValid) {
        return { success: true, data: data as unknown as LLMOutput };
    } else {
        const errors = validateInternal.errors?.map(err => {
            const path = err.instancePath ? `Field ${err.instancePath} ` : "";
            return `${path}${err.message}` || "Unknown validation error";
        }) || ["Unknown validation error"];

        return { success: false, errors };
    }
};
