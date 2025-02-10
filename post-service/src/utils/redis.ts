import { logger } from "./logger";

export const invalidatePostCache = async (req: any, input: any, del = false) => {
    const keys = await req.redisClient.keys('posts:*');
    if (keys?.length > 0) {
        await req.redisClient.del(keys);
        logger.info("Redis Cache Invalidated")
    }
    if (del) {
        const postKey = await req.redisClient.keys(`post:${input}`);
        if (postKey?.length) {
            await req.redisClient.del(postKey);
            logger.info("Post Cache Invalidated")
        }
    }
    return
}
