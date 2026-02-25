import request from 'supertest';
import { app } from '../index';
import { LLMService } from '../services/llm.service';

/**
 * Helper to poll job status
 */
async function pollJobStatus(jobId: string, maxRetries = 10, delayMs = 500) {
    for (let i = 0; i < maxRetries; i++) {
        const response = await request(app).get(`/api/jobs/${jobId}`);
        if (response.body.status !== 'queued' && response.body.status !== 'processing') {
            return response.body;
        }
        await new Promise(res => setTimeout(res, delayMs));
    }
    throw new Error('Polled too long for job');
}

describe('POST /api/jobs - Integration flow', () => {

    it('should process the Odyssey transcript and verify task dependencies via async jobs', async () => {
        const transcript = `
**Meeting Title:** Project Odyssey - Pre-Launch Sync
        `;

        const mockLLMResponse = {
            tasks: [
                {
                    id: "fix_stripe_bug",
                    description: "Fix the P0 Stripe race condition.",
                    priority: 1,
                    dependencies: []
                },
                {
                    id: "regression_test",
                    description: "Run regression test.",
                    priority: 1,
                    dependencies: ["fix_stripe_bug"]
                },
                {
                    id: "press_screenshots",
                    description: "Get analytics screenshots.",
                    priority: 2,
                    dependencies: ["fix_stripe_bug"]
                },
                {
                    id: "ab_test_headlines",
                    description: "Prepare A/B test for homepage headline copy.",
                    priority: 5,
                    dependencies: []
                }
            ]
        };

        const extractTasksSpy = jest.spyOn(LLMService, 'extractTasks').mockResolvedValue(mockLLMResponse);

        // 1. Submit Transcript
        const submitResponse = await request(app)
            .post('/api/jobs')
            .send({ transcript });

        expect(submitResponse.status).toBe(202);
        expect(submitResponse.body).toHaveProperty('jobId');
        const jobId = submitResponse.body.jobId;

        // 2. Poll for results
        const jobResult = await pollJobStatus(jobId);

        expect(jobResult.status).toBe('done');
        expect(jobResult).toHaveProperty('result');
        const result = jobResult.result;

        // Assertions on result tasks
        const tasks = result.tasks;
        expect(tasks.length).toBe(4);

        const stripeBug = tasks.find((t: any) => t.description.includes("Stripe"));
        expect(stripeBug.dependencies).toBe("");

        const regressionTask = tasks.find((t: any) => t.description.includes("regression"));
        expect(regressionTask.dependencies).toContain("fix_stripe_bug");

        const abTest = tasks.find((t: any) => t.description.includes("A/B test"));
        expect(abTest.priority).toBe(5);
        expect(abTest.dependencies).toBe("");

        expect(result.cycles.length).toBe(0);

        extractTasksSpy.mockRestore();
    });

    it('should fail if a cycle is introduced (simulated via mock)', async () => {
        const cyclicMock = {
            tasks: [
                { id: "A", description: "A", priority: 1, dependencies: ["B"] },
                { id: "B", description: "B", priority: 1, dependencies: ["A"] }
            ]
        };

        jest.spyOn(LLMService, 'extractTasks').mockResolvedValue(cyclicMock);

        const submitResponse = await request(app)
            .post('/api/jobs')
            .send({ transcript: "Cycle test" });

        expect(submitResponse.status).toBe(202);
        const jobId = submitResponse.body.jobId;

        const jobResult = await pollJobStatus(jobId);
        expect(jobResult.status).toBe('done');

        const result = jobResult.result;
        expect(result.cycles.length).toBeGreaterThan(0);

        const tasks = result.tasks;
        tasks.forEach((t: any) => {
            expect(t.status).toBe('blocked');
        });
    });

    it('should not call LLM again for duplicate transcript submissions', async () => {
        const transcriptText = "duplicate test transcript";
        const mockTasks = {
            tasks: [{ id: "dup_1", description: "Dup", priority: 1, dependencies: [] }]
        };

        const extractTasksSpy = jest.spyOn(LLMService, 'extractTasks').mockResolvedValue(mockTasks);

        // First call
        const res1 = await request(app).post('/api/jobs').send({ transcript: transcriptText });
        const jobResult1 = await pollJobStatus(res1.body.jobId);
        expect(jobResult1.status).toBe('done');

        // Second call with same transcript
        const res2 = await request(app).post('/api/jobs').send({ transcript: transcriptText });
        const jobResult2 = await pollJobStatus(res2.body.jobId);
        expect(jobResult2.status).toBe('done');

        // Verify LLM called only once
        expect(extractTasksSpy).toHaveBeenCalledTimes(1);

        // Output tasks should be identical
        expect(jobResult1.result.tasks[0].externalId).toBe("dup_1");
        expect(jobResult2.result.tasks[0].externalId).toBe("dup_1");

        extractTasksSpy.mockRestore();
    });
});
