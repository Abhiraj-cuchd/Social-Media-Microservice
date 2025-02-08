import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const _envConfig = {
    node_env: process.env.NODE_ENV,
    identity_service_url: process.env.IDENTITY_SERVICE_URL,
    port: process.env.PORT || 3000,
    redis_url: process.env.REDIS_URL
}
Object.freeze(_envConfig);
export { _envConfig }
