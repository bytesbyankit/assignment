"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLLMOutput = void 0;
const ajv_1 = __importDefault(require("ajv"));
const schema_1 = require("./schema");
const ajv = new ajv_1.default({ allErrors: true });
const validateInternal = ajv.compile(schema_1.llmOutputSchema);
const validateLLMOutput = (data) => {
    const isValid = validateInternal(data);
    if (isValid) {
        return { success: true, data: data };
    }
    else {
        const errors = validateInternal.errors?.map(err => {
            const path = err.instancePath ? `Field ${err.instancePath} ` : "";
            return `${path}${err.message}` || "Unknown validation error";
        }) || ["Unknown validation error"];
        return { success: false, errors };
    }
};
exports.validateLLMOutput = validateLLMOutput;
//# sourceMappingURL=validator.js.map