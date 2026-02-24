import { Router } from 'express';
import transcriptRoutes from './transcript.routes';
import jobRoutes from './job.routes';

const router = Router();

router.use('/transcripts', transcriptRoutes);
router.use('/jobs', jobRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

export default router;
