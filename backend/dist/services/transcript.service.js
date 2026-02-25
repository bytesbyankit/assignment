"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptService = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const llm_service_1 = require("./llm.service");
const validator_1 = require("../utils/validator");
const sanitizer_1 = require("../utils/sanitizer");
const graph_1 = require("../utils/graph");
const prisma = new client_1.PrismaClient();
class TranscriptService {
    static async processTranscript(transcriptText) {
        const hash = (0, hash_1.computeHash)(transcriptText);
        // 1. Check for existing transcript (idempotency)
        let transcript = await prisma.transcript.findFirst({
            where: { transcriptHash: hash },
            include: { tasks: true }
        });
        if (transcript && transcript.tasks.length > 0) {
            const taskNodes = transcript.tasks.map(t => ({
                id: t.externalId,
                description: t.description,
                priority: t.priority,
                dependencies: t.dependencies ? t.dependencies.split(',').filter(d => d.trim() !== '') : []
            }));
            const cycleResult = (0, graph_1.detectCycles)(taskNodes);
            return {
                transcriptId: transcript.id,
                tasks: transcript.tasks,
                cycles: cycleResult.cycles,
                warnings: ["Returned existing tasks for this transcript."]
            };
        }
        if (!transcript) {
            // 2. Store new transcript
            transcript = await prisma.transcript.create({
                data: {
                    transcriptText,
                    transcriptHash: hash,
                },
                include: { tasks: true }
            });
        }
        // 3. Call LLM
        const extractionResult = await llm_service_1.LLMService.extractTasks(transcriptText);
        // 4. Validate
        const validation = (0, validator_1.validateLLMOutput)(extractionResult);
        if (!validation.success) {
            throw new Error(`LLM output validation failed: ${validation.errors.join(', ')}`);
        }
        // 5. Sanitize
        const { sanitizedTasks, warnings } = (0, sanitizer_1.sanitizeDependencies)(validation.data.tasks);
        // 6. Detect Cycles
        const cycleResult = (0, graph_1.detectCycles)(sanitizedTasks);
        // 7. Persist and map status
        const cyclicIds = new Set(cycleResult.cycles.flat());
        const createdTasks = await Promise.all(sanitizedTasks.map((task) => {
            return prisma.task.create({
                data: {
                    transcriptId: transcript.id,
                    externalId: task.id,
                    description: task.description,
                    priority: task.priority,
                    dependencies: task.dependencies.join(','),
                    status: cyclicIds.has(task.id) ? 'blocked' : 'ready'
                }
            });
        }));
        return {
            transcriptId: transcript.id,
            tasks: createdTasks,
            cycles: cycleResult.cycles,
            warnings
        };
    }
}
exports.TranscriptService = TranscriptService;
//# sourceMappingURL=transcript.service.js.map