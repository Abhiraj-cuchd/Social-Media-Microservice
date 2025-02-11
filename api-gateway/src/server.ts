import express, { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import Redis from 'ioredis';
import { _envConfig } from './utils/config';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { RedisReply, RedisStore } from 'rate-limit-redis'
import { logger } from './utils/logger';
import proxy from 'express-http-proxy'
import { errorHandler } from './middleware/errorHandler';
import { validateToken } from './middleware/auth.middleware';

const app = express();
dotenv.config();

const redisClient = new Redis(_envConfig.redis_url!);

app.use(helmet());
app.use(cors());
app.use(express.json());

//IP Based Rate Limiting for sensitive Endpoints
const gatewayRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 50 requests per windowMs
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

app.use(gatewayRateLimit);

app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req: Request) => {
        return req.originalUrl.replace(/^\/v1/, "/api")
    },
    proxyErroHandler: (err: any, res: Response, next: NextFunction) => {
        logger.error(`Proxy Error: ${err.message}`);
        res.status(500).json({
            message: `Internal Server Error`, error: err.message
        });
    }
};

//<=========  IDENTITY SERVICE PROXY ==========>
app.use('/v1/auth', proxy(_envConfig.identity_service_url!, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from Identity Service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}));

//<=========  POST SERVICE PROXY ==========>
app.use('/v1/posts', validateToken, proxy(_envConfig.post_service_url!, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: any) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from Post Service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}))

//<=========  MEDIA SERVICE PROXY ==========>
app.use('/v1/media', validateToken, proxy(_envConfig.media_service_url!, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: any) => {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        if (!srcReq.headers['content-type'].startsWith('multipart/form-data')) {
            proxyReqOpts.headers["Content-Type"] = "application/json";
        }
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response recieved from Media Service: ${proxyRes.statusCode}`);
        return proxyResData;
    },
    parseReqBody: false
}));

app.use(errorHandler);
app.listen(_envConfig.port, () => {
    logger.info(`API Gateway is running on PORT: ${_envConfig.port}`);
    logger.info(`Identity Service is running on: ${_envConfig.identity_service_url}`);
    logger.info(`Post Service is running on: ${_envConfig.post_service_url}`);
    logger.info(`Media Service is running on: ${_envConfig.media_service_url}`);
    logger.info(`Redis Url: ${_envConfig.redis_url}`)
});
