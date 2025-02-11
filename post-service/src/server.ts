import express, { NextFunction, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import rateLimit from 'express-rate-limit';
const postRoutes = require('./routes/index');
import RedisStore, { RedisReply } from 'rate-limit-redis';
import { _envConfig, connectDB } from './utils/config';
import { connectRabbitMQ } from './utils/rabbitmq';

const app = express();
dotenv.config();

const redisClient = new Redis(_envConfig.redis_url!);
connectDB();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
});


//IP Based Rate Limiting for sensitive Endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive Endpoint Rate limit exceeded for IP: ${req.ip!}`);
        res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
        sendCommand: async (...args: string[]) => {
            return redisClient.call(args[0], ...args.slice(1)) as unknown as RedisReply;
        }
    })
});

app.use('/api/post', sensitiveEndpointsLimiter);

app.use('/api/posts', (req: any, res: Response, next: NextFunction) => {
    req.redisClient = redisClient;
    next();
}, postRoutes);

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectRabbitMQ();
        app.listen(_envConfig.port, () => {
            logger.info(`Post Service Running on PORT: ${_envConfig.port}`)
        });
    } catch (error) {
        logger.info(`Failed to connect to server`, error);
        process.exit(1);
    }
}

startServer();


//unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, "reason", reason)
})
