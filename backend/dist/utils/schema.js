"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmOutputSchema = void 0;
exports.llmOutputSchema = {
    type: "object",
    properties: {
        tasks: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "integer", minimum: 1, maximum: 5 },
                    dependencies: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["id", "description", "priority", "dependencies"],
                additionalProperties: false
            }
        }
    },
    required: ["tasks"],
    additionalProperties: false
};
//# sourceMappingURL=schema.js.map