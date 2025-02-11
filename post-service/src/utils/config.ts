import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './logger';

dotenv.config();

const _envConfig = {
    node_env: process.env.NODE_ENV,
    mongo_url: process.env.MONGO_URL,
    jwt_secret: process.env.JWT_SECRET,
    port: process.env.PORT || 3002,
    redis_url: process.env.REDIS_URL,
    rabbitmq_url: process.env.RABBITMQ_URL
}
Object.freeze(_envConfig);


export const connectDB = () => {
    const { mongo_url } = _envConfig
    mongoose.connect(mongo_url!).then(() => logger.info('Connected to MongoDB')).catch((e) => logger.error('Mongo Connection Error', e))
}

export { _envConfig }
