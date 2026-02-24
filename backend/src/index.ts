import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import mainRouter from './routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', mainRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.on('close', () => {
    console.log('Server closed');
});

export { app, prisma };
