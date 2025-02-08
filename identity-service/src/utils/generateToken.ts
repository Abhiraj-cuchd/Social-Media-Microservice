import jwt from 'jsonwebtoken';
import { IUser } from '../types/ModelInterface';
import crypto from 'crypto';
import { RefreshTokenModel } from '../models/RefreshToken.model';
import { _envConfig } from './config';
const { jwt_secret } = _envConfig
export const generateTokens = async (user: IUser | null) => {

    if (!jwt_secret) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const accessToken = jwt.sign(
        {
            userId: user?._id,
            username: user?.username,
        },
        jwt_secret,
        { expiresIn: '10m' }
    );
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshTokenModel.create({
        token: refreshToken,
        user: user?._id,
        expiresAt
    })
    return { accessToken, refreshToken };
};
