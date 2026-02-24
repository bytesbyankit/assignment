import { PrismaClient } from '@prisma/client';
import { computeHash } from '../utils/hash';
import { TranscriptService } from './transcript.service';

const prisma = new PrismaClient();

export class JobService {
    /**
     * Creates a new job or returns an existing one if currently processing/done for this hash.
     */
    static async createJob(transcript: string): Promise<string> {
        const hash = computeHash(transcript);

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

    static async getJobStatus(jobId: string) {
        return prisma.job.findUnique({
            where: { id: jobId },
        });
    }

    private static async processJobInBackground(jobId: string, transcript: string) {
        try {
            await prisma.job.update({
                where: { id: jobId },
                data: { status: 'processing' },
            });

            const result = await TranscriptService.processTranscript(transcript);

            await prisma.job.update({
                where: { id: jobId },
                data: {
                    status: 'done',
                    result: JSON.stringify(result),
                },
            });
        } catch (error: any) {
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
