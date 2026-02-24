import request from 'supertest';
import { app } from '../index';
import { LLMService } from '../services/llm.service';

/**
 * Integration Test for Project Odyssey flow.
 */
describe('POST /api/transcripts - Project Odyssey Integration', () => {

    it('should process the Odyssey transcript and verify task dependencies', async () => {
        const transcript = `
**Meeting Title:** Project Odyssey - Pre-Launch Technical & GTM Sync
... (transcript content) ...
        `;

        // Mock the LLM response to match the Odyssey requirements
        const mockLLMResponse = {
            tasks: [
                {
                    id: "fix_stripe_bug",
                    description: "Fix the P0 Stripe payment gateway race condition.",
                    priority: 1,
                    dependencies: []
                },
                {
                    id: "regression_test",
                    description: "Run full regression test weekend.",
                    priority: 1,
                    dependencies: ["fix_stripe_bug"]
                },
                {
                    id: "press_screenshots",
                    description: "Get high-res analytics dashboard screenshots.",
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

        // Spy on LLMService.extractTasks and return our mock
        const extractTasksSpy = jest.spyOn(LLMService, 'extractTasks').mockResolvedValue(mockLLMResponse);

        const response = await request(app)
            .post('/api/transcripts')
            .send({ transcript });

        // Assertions
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transcriptId');

        const tasks = response.body.tasks;
        expect(tasks.length).toBe(4);

        // 1. Payment bug task has no dependencies
        const stripeBug = tasks.find((t: any) => t.description.includes("Stripe"));
        expect(stripeBug.dependencies).toBe("");

        // 2. QA (regression) and screenshots depend on a stable build (stripe bug)
        const regressionTask = tasks.find((t: any) => t.description.includes("regression"));
        const screenshotsTask = tasks.find((t: any) => t.description.includes("screenshots"));

        expect(regressionTask.dependencies).toContain("fix_stripe_bug");
        expect(screenshotsTask.dependencies).toContain("fix_stripe_bug");

        // 3. A/B test task exists with low priority (5) and no dependencies
        const abTest = tasks.find((t: any) => t.description.includes("A/B test"));
        expect(abTest.priority).toBe("5");
        expect(abTest.dependencies).toBe("");

        // 4. No cycles are reported
        expect(response.body.cycles.length).toBe(0);

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

        const response = await request(app)
            .post('/api/transcripts')
            .send({ transcript: "Cycle test" });

        expect(response.status).toBe(201);
        expect(response.body.cycles.length).toBeGreaterThan(0);

        // Assert that cyclic tasks are marked as blocked
        const tasks = response.body.tasks;
        tasks.forEach((t: any) => {
            expect(t.status).toBe('blocked');
        });
    });
});
