import { Router } from 'express';
import { JobService } from '../services/job.service';

const router = Router();

// POST /api/jobs - Submit a transcript for background processing
router.post('/', async (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        const jobId = await JobService.createJob(transcript);
        res.status(202).json({ jobId });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/jobs/:jobId - Check job status and get results
router.get('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobService.getJobStatus(jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const response: any = {
            jobId: job.id,
            status: job.status,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };

        if (job.status === 'done' && job.result) {
            response.result = JSON.parse(job.result);
        }

        if (job.status === 'error') {
            response.error = job.error;
        }

        res.json(response);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
