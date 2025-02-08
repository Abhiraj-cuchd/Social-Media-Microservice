import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { validateLogin, validateRegistration } from "../utils/validations";
import { UserModel } from "../models/User.model";
import { generateTokens } from "../utils/generateToken";
import { RefreshTokenModel } from "../models/RefreshToken.model";
import { IUser } from "../types/ModelInterface";


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Registration endpoint hit")
    try {
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn('Validation Error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }
        const { username, email, password } = req.body;
        let user = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (user) {
            logger.warn("User Already Present");
            res.status(400).json({
                success: false,
                message: "User Already Exists"
            });
        } else {
            user = new UserModel({ username, email, password });
            await user.save();
            logger.info('User Created', user?._id)
            const { accessToken, refreshToken } = await generateTokens(user);
            res.status(201).json({
                success: true,
                message: "User Created",
                user,
                accessToken,
                refreshToken
            });
        }
    } catch (error) {
        logger.error("Registration Errro Occured", error);
        next(error)
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Login endpoint hit")
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn('Validation Error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }
        const { email, password } = req.body;
        const user: any = await UserModel.findOne({ email });
        if (!user) {
            logger.warn("Invalid User");
            res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
        }
        const isValidPassword = await user!.comparePassword(password);
        if (!isValidPassword) {
            logger.warn("Wrong Password");
            res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const { accessToken, refreshToken } = await generateTokens(user);
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            userId: user?._id
        })

    } catch (error) {
        logger.error("Login Error Occured", error);
        next(error)
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Refresh Token endpoint hit");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn('Refresh Token Missing');
            res.status(400).json({
                success: false,
                message: 'Referesh Token Missing'
            })
        }

        const storedToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn('Invalid or Expired Refresh Token');
            res.status(401).json({
                success: false,
                message: "Invalid or Expired Refresh Token"
            });
        }

        const user: IUser | null = await UserModel.findById(storedToken?.user);
        if (!user) {
            logger.warn('User Not Found');
            res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);

        await RefreshTokenModel.deleteOne({ _id: storedToken?._id });
        res.status(201).json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        logger.error("Refresh Token Error Occured", error);
        next(error)
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Logout Endpoint Hit");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn('Refresh Token Missing');
            res.status(400).json({
                success: false,
                message: 'Referesh Token Missing'
            })
        }

        await RefreshTokenModel.deleteOne({ token: refreshToken });
        logger.info('Refresh Token Deleted for Logout');
        res.status(200).json({
            success: true,
            message: 'Logged out Successfully'
        });
    } catch (error) {
        logger.error("Error While Loggin out", error);
        next(error)
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}
