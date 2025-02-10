import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './logger';

dotenv.config();

const _envConfig = {
    node_env: process.env.NODE_ENV,
    mongo_url: process.env.MONGO_URL,
    jwt_secret: process.env.JWT_SECRET,
    port: process.env.PORT || 3003,
    redis_url: process.env.REDIS_URL,
    aws_access_key: process.env.AWS_ACCESS_KEY,
    aws_secret: process.env.AWS_SECRET_KEY,
    aws_region: process.env.AWS_REGION,
    aws_bucket_name: process.env.AWS_BUCKET_NAME
}
Object.freeze(_envConfig);


export const connectDB = () => {
    const { mongo_url } = _envConfig
    mongoose.connect(mongo_url!).then(() => logger.info('Connected to MongoDB')).catch((e) => logger.error('Mongo Connection Error', e))
}

export { _envConfig }
