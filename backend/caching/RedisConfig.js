import { createClient } from 'redis';
import dotenv from 'dotenv';
import pkg from 'bullmq';
const {Queue, Worker, QueueScheduler } = pkg;
import IORedis from 'ioredis';

dotenv.config();

export const Redisclient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 16337
    }
});

Redisclient.on('error', err => console.log('Redis Client Error', err));

await Redisclient.connect();




// Connect to cloud Redis
// const connection = new IORedis(process.env.REDIS_HOST);

// // Create a queue
// const myQueue = new Queue('emailQueue', { connection });

// // Add a job (example)
// myQueue.add('sendWelcomeEmail', { userId: '123' });

// // Process the job
// const worker = new Worker('emailQueue', async job => {
//   console.log('Processing job:', job.name, job.data);
// }, { connection });

// // Schedule recurring jobs (cron-like)
// const scheduler = new QueueScheduler('emailQueue', { connection });

// myQueue.add('sendNewsletter', {}, {
//   repeat: { cron: '0 8 * * *' } // every day at 8 AM
// });
