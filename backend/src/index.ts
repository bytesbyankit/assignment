import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import morgan from 'morgan';
import mainRouter from './routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json());

app.use('/api', mainRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

if (require.main === module) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error: any) => {
        console.error('Server error:', error);
    });

    server.on('close', () => {
        console.log('Server closed');
    });
}

export { app, prisma };
