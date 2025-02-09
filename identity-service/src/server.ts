import express from 'express'
import { _envConfig, connectDB } from './utils/config';
import helmet from 'helmet';
import cors from 'cors'
import { logger } from './utils/logger';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import { errorHandler } from './middleware/errorHandler';
const routes = require('./routes/index');


const app = express();
connectDB();

const redisClient = new Redis(_envConfig.redis_url!)

// GLOBAL MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
});

// DDos Protection and Rate Limiter
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10,
    duration: 1
})

app.use((req, res, next) => {
    rateLimiter.consume(req.ip!).then(() => next()).catch(() => {
        logger.warn(`Rate limit Exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many Request" })
    });
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

app.use('/api/auth/register', sensitiveEndpointsLimiter);

//Routes
app.use('/api/auth', routes);

//Error Handler
app.use(errorHandler);

app.listen(_envConfig.port, () => {
    logger.info(`Identity Service Running on PORT: ${_envConfig.port}`)
});

//unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, "reason", reason)
})
