"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const transcript_service_1 = require("./transcript.service");
const prisma = new client_1.PrismaClient();
class JobService {
    /**
     * Creates a new job or returns an existing one if currently processing/done for this hash.
     */
    static async createJob(transcript) {
        const hash = (0, hash_1.computeHash)(transcript);
        // Check for existing finished/processing job with same hash for idempotency
        const existingJob = await prisma.job.findFirst({
            where: {
                transcriptHash: hash,
                status: { in: ['queued', 'processing', 'done'] },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (existingJob) {
            return existingJob.id;
        }
        const job = await prisma.job.create({
            data: {
                transcriptHash: hash,
                status: 'queued',
            },
        });
        // Fire and forget background processing
        this.processJobInBackground(job.id, transcript).catch(console.error);
        return job.id;
    }
    static async getJobStatus(jobId) {
        return prisma.job.findUnique({
            where: { id: jobId },
        });
    }
    static async processJobInBackground(jobId, transcript) {
        try {
            await prisma.job.update({
                where: { id: jobId },
                data: { status: 'processing' },
            });
            const result = await transcript_service_1.TranscriptService.processTranscript(transcript);
            await prisma.job.update({
                where: { id: jobId },
                data: {
                    status: 'done',
                    result: JSON.stringify(result),
                },
            });
        }
        catch (error) {
            console.error(`Error processing job ${jobId}:`, error);
            await prisma.job.update({
                where: { id: jobId },
                data: {
                    status: 'error',
                    error: error.message || 'Unknown error',
                },
            });
        }
    }
}
exports.JobService = JobService;
//# sourceMappingURL=job.service.js.map