import { Router } from 'express';
import jobRoutes from './job.routes';

const router = Router();

router.use('/jobs', jobRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

export default router;
