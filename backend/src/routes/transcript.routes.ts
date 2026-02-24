import { Router } from 'express';
import { TranscriptService } from '../services/transcript.service';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        const result = await TranscriptService.processTranscript(transcript);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Transcript processing error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;
