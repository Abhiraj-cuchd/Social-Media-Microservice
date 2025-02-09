import { logger } from "./logger";

export const invalidatePostCache = async (req: any, input: any) => {
    const keys = await req.redisClient.keys('posts:*');
    if (keys?.length > 0) {
        await req.redisClient.del(keys);
        logger.info("Redis Cache Invalidated")
    }
    return
}
