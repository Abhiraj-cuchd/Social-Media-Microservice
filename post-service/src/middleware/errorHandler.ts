import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(error.stack);
    res.status(error.status || 500).json({
        message: error.message || 'Internal Server Error from Middleware'
    })
}
