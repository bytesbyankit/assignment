import { PrismaClient } from '@prisma/client';
import { computeHash } from '../utils/hash';
import { LLMService } from './llm.service';
import { validateLLMOutput } from '../utils/validator';
import { sanitizeDependencies } from '../utils/sanitizer';
import { detectCycles } from '../utils/graph';

const prisma = new PrismaClient();

export class TranscriptService {
    static async processTranscript(transcriptText: string) {
        const hash = computeHash(transcriptText);

        // 1. Check for existing transcript (idempotency)
        let transcript = await prisma.transcript.findFirst({
            where: { transcriptHash: hash }
        });

        if (!transcript) {
            // 2. Store new transcript
            transcript = await prisma.transcript.create({
                data: {
                    transcriptText,
                    transcriptHash: hash,
                }
            });
        } else {
            // Optionally: If it exists, we might want to return existing tasks 
            // but the requirement says "Persist tasks" so I'll proceed with extraction 
            // unless the user specifically wants to skip. I'll re-process for fresh tasks.
            await prisma.task.deleteMany({ where: { transcriptId: transcript.id } });
        }

        // 3. Call LLM
        const extractionResult = await LLMService.extractTasks(transcriptText);

        // 4. Validate
        const validation = validateLLMOutput(extractionResult);
        if (!validation.success) {
            throw new Error(`LLM output validation failed: ${validation.errors.join(', ')}`);
        }

        // 5. Sanitize
        const { sanitizedTasks, warnings } = sanitizeDependencies(validation.data.tasks);

        // 6. Detect Cycles
        const cycleResult = detectCycles(sanitizedTasks);

        // 7. Persist and map status
        const cyclicIds = new Set(cycleResult.cycles.flat());

        const createdTasks = await Promise.all(
            sanitizedTasks.map((task) => {
                return prisma.task.create({
                    data: {
                        transcriptId: transcript!.id,
                        description: task.description,
                        priority: task.priority.toString(),
                        dependencies: task.dependencies.join(','),
                        status: cyclicIds.has(task.id) ? 'blocked' : 'ready'
                    }
                });
            })
        );

        return {
            transcriptId: transcript.id,
            tasks: createdTasks,
            cycles: cycleResult.cycles,
            warnings
        };
    }
}
