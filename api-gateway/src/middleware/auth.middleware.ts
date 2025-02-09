import { NextFunction, Request, Response } from "express"
import { logger } from "../utils/logger";
import jwt from 'jsonwebtoken';
import { _envConfig } from "../utils/config";

export const validateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader: string | undefined = req.headers['authorization'];
    const token = authHeader && authHeader?.split(' ')[1];

    if (!token) {
        logger.warn(`Access attempt without valid token`);
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    jwt.verify(token as string, _envConfig.jwt_secret!, (err: any, user: any) => {
        if (err) {
            logger.warn(`Invalid Token`);
            res.status(429).json({
                success: false,
                message: 'Invalid Token'
            });
        }

        req.user = user;
        next();
    })
}
