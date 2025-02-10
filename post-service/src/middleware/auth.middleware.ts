import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const authenticateRequest = (req: any, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id']
    if (!userId) {
        logger.warn(`Access Attempted without user ID`);
        return res.status(401).json({
            success: false,
            message: `User Not Authroized`
        })
    }

    

    req.user = { userId }
    next();
}
